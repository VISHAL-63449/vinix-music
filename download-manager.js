/**
 * VR Music — Real Download Manager
 * IndexedDB-backed offline audio storage with true byte-level progress,
 * pause/resume/cancel/retry, quality preference, storage accounting and
 * offline playback via object URLs.
 */
(function () {
    'use strict';

    const DB_NAME = 'vrmusic_downloads';
    const DB_VERSION = 1;
    const FILE_STORE = 'files';
    const META_STORE = 'meta';
    const QUALITY_KEY = 'vrmusic_download_quality';

    const tasks = {};
    const metaMap = {};
    const objectUrls = {};
    const listeners = new Set();

    let dbPromise = null;
    let initialized = false;

    function openDB() {
        if (dbPromise) return dbPromise;
        dbPromise = new Promise((resolve, reject) => {
            const req = indexedDB.open(DB_NAME, DB_VERSION);
            req.onupgradeneeded = (e) => {
                const d = e.target.result;
                if (!d.objectStoreNames.contains(FILE_STORE)) d.createObjectStore(FILE_STORE);
                if (!d.objectStoreNames.contains(META_STORE)) d.createObjectStore(META_STORE, { keyPath: 'id' });
            };
            req.onsuccess = (e) => resolve(e.target.result);
            req.onerror = (e) => reject(e.target.error);
        });
        return dbPromise;
    }

    function dbRequest(store, mode, fn) {
        return openDB().then((db) => new Promise((resolve, reject) => {
            const tx = db.transaction(store, mode);
            const s = tx.objectStore(store);
            const out = fn(s);
            tx.oncomplete = () => resolve(out && out.result !== undefined ? out.result : undefined);
            tx.onerror = (e) => reject(e.target.error);
            tx.onabort = (e) => reject(e.target.error);
        }));
    }

    function saveFile(key, blob) {
        return dbRequest(FILE_STORE, 'readwrite', (s) => s.put(blob, key));
    }

    function getFile(key) {
        return dbRequest(FILE_STORE, 'readonly', (s) => {
            const r = s.get(key);
            r.onerror = () => {};
            return r;
        }).then((v) => v && v.size !== undefined ? v : null);
    }

    function removeFile(key) {
        return dbRequest(FILE_STORE, 'readwrite', (s) => s.delete(key));
    }

    function saveMeta(meta) {
        return dbRequest(META_STORE, 'readwrite', (s) => s.put(meta));
    }

    function removeMeta(id) {
        return dbRequest(META_STORE, 'readwrite', (s) => s.delete(id));
    }

    function getAllMeta() {
        return dbRequest(META_STORE, 'readonly', (s) => s.getAll());
    }

    function getPartialKeys() {
        return openDB().then((db) => new Promise((resolve, reject) => {
            const tx = db.transaction(FILE_STORE, 'readonly');
            const keys = [];
            const req = tx.objectStore(FILE_STORE).openCursor();
            req.onsuccess = (e) => {
                const cur = e.target.result;
                if (cur) {
                    if (String(cur.key).startsWith('partial_')) keys.push(cur.key);
                    cur.continue();
                } else {
                    resolve(keys);
                }
            };
            req.onerror = (e) => reject(e.target.error);
        }));
    }

    function emit(type, id) {
        listeners.forEach((fn) => {
            try { fn(type, id); } catch (e) { /* noop */ }
        });
    }

    function detectQuality(file) {
        const f = String(file).toLowerCase();
        if (/\.(flac|wav|aiff|alac)$/.test(f)) return 'LOSSLESS';
        return 'HIGH';
    }

    function getQualityPref() {
        return localStorage.getItem(QUALITY_KEY) || 'HIGH';
    }

    function setQualityPref(q) {
        localStorage.setItem(QUALITY_KEY, q);
        emit('quality', q);
    }

    function metaFromTask(task) {
        return {
            id: task.id,
            song: task.song,
            quality: task.quality,
            size: task.total || 0,
            downloadedAt: task.downloadedAt || Date.now()
        };
    }

    function isStreamable() {
        return typeof window !== 'undefined' &&
            location.protocol !== 'file:' &&
            typeof fetch === 'function';
    }

    async function persistPartial(task) {
        if (task.chunks && task.chunks.length) {
            const partial = new Blob(task.chunks, { type: 'audio/mpeg' });
            task.chunks = [];
            task.stored = (task.stored || 0) + partial.size;
            await saveFile('partial_' + task.id, partial);
        }
    }

    async function runTask(task) {
        const controller = new AbortController();
        task.controller = controller;
        task.state = 'downloading';
        task.error = '';
        emit('change', task.id);

        try {
            if (!isStreamable()) {
                throw new Error('file:// browsing blocks real downloads. Run `node server.js` (http://localhost:3000) for full offline downloads.');
            }
            const partialSize = task.stored || 0;
            const headers = partialSize > 0 ? { Range: 'bytes=' + partialSize + '-' } : {};
            const res = await fetch(encodeURI(task.song.file), { signal: controller.signal, headers });
            if (!res.ok && res.status !== 206 && res.status !== 200) throw new Error('HTTP ' + res.status);
            const reader = res.body.getReader();
            const contentRange = res.headers.get('Content-Range');
            const totalHeader = res.headers.get('Content-Length');
            let total = task.total;
            if (partialSize > 0 && contentRange) {
                const totalPart = parseInt(contentRange.split('/')[1], 10);
                if (!isNaN(totalPart)) total = totalPart;
            } else if (totalHeader) {
                total = partialSize + parseInt(totalHeader, 10);
            }
            task.total = total || (partialSize + 1);
            task.loaded = partialSize;

            const chunks = [];
            task.chunks = chunks;
            let windowBytes = 0;
            let windowStart = performance.now();
            task.speed = 0;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                chunks.push(value);
                task.loaded += value.length;
                windowBytes += value.length;
                const now = performance.now();
                const dt = (now - windowStart) / 1000;
                if (dt >= 1) {
                    task.speed = windowBytes / dt;
                    windowBytes = 0;
                    windowStart = now;
                }
                task.progress = task.total ? Math.min(100, (task.loaded / task.total) * 100) : 0;
                emit('progress', task.id);
            }

            let blob;
            if (partialSize > 0) {
                const partial = await getFile('partial_' + task.id);
                blob = new Blob([partial || new Blob([]), ...chunks], { type: 'audio/mpeg' });
                await removeFile('partial_' + task.id);
            } else {
                blob = new Blob(chunks, { type: 'audio/mpeg' });
            }

            await saveFile(task.id, blob);
            task.chunks = [];
            task.state = 'completed';
            task.speed = 0;
            task.progress = 100;
            task.downloadedAt = Date.now();
            metaMap[task.id] = metaFromTask(task);
            await saveMeta(metaMap[task.id]);
            emit('change', task.id);
        } catch (err) {
            if (err && err.name === 'AbortError') {
                if (task.state === 'paused') {
                    await persistPartial(task);
                    emit('change', task.id);
                } else {
                    task.state = 'cancelled';
                    await persistPartial(task);
                    emit('change', task.id);
                }
            } else {
                task.state = 'failed';
                task.error = (err && err.message) || 'Network error';
                await persistPartial(task);
                emit('change', task.id);
            }
        }
    }

    function createTask(song, quality) {
        return {
            id: song.id,
            song: song,
            quality: quality || detectQuality(song.file),
            state: 'idle',
            progress: 0,
            loaded: 0,
            stored: 0,
            total: 0,
            speed: 0,
            error: '',
            chunks: [],
            controller: null
        };
    }

    const DownloadManager = {
        init() {
            if (initialized) return Promise.resolve();
            initialized = true;
            return openDB().then(() => getAllMeta()).then((metaList) => {
                metaList.forEach((m) => { metaMap[m.id] = m; });
                return getPartialKeys();
            }).then((partialKeys) => {
                partialKeys.forEach((key) => {
                    const id = key.replace('partial_', '');
                    if (metaMap[id]) return;
                    const song = window.MockBackend && window.MockBackend.getSongs
                        ? window.MockBackend.getSongs().find((s) => s.id === id)
                        : null;
                    if (!song) return;
                    tasks[id] = createTask(song, getQualityPref());
                    tasks[id].state = 'paused';
                    tasks[id].stored = 0;
                    getFile(key).then((blob) => {
                        if (blob) {
                            tasks[id].stored = blob.size;
                            tasks[id].loaded = blob.size;
                            tasks[id].total = blob.size;
                            emit('change', id);
                        }
                    });
                });
                emit('ready', null);
            }).catch((e) => {
                console.error('DownloadManager init failed:', e);
            });
        },

        subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },

        isDownloaded(id) { return !!metaMap[id]; },
        getMeta(id) { return metaMap[id] || null; },
        getAllMeta() { return Object.values(metaMap); },
        getTask(id) { return tasks[id] || null; },
        getTasks() { return Object.values(tasks); },
        getQualityPref,
        setQualityPref,
        detectQuality,

        start(song, quality) {
            if (tasks[song.id] && (tasks[song.id].state === 'downloading' || tasks[song.id].state === 'paused')) {
                if (tasks[song.id].state === 'paused') this.resume(song.id);
                return;
            }
            if (this.isDownloaded(song.id)) return;
            const task = createTask(song, quality || getQualityPref());
            tasks[song.id] = task;
            runTask(task);
        },

        pause(id) {
            const t = tasks[id];
            if (t && t.state === 'downloading' && t.controller) {
                t.state = 'paused';
                t.controller.abort();
            }
        },

        resume(id) {
            if (metaMap[id]) return;
            let t = tasks[id];
            if (!t) {
                const song = window.MockBackend && window.MockBackend.getSongs
                    ? window.MockBackend.getSongs().find((s) => s.id === id)
                    : null;
                if (!song) return;
                t = createTask(song, getQualityPref());
                tasks[id] = t;
            }
            getFile('partial_' + id).then((blob) => {
                if (blob) {
                    t.stored = blob.size;
                    t.loaded = blob.size;
                }
                t.state = 'resuming';
                emit('change', id);
                runTask(t);
            });
        },

        cancel(id) {
            const t = tasks[id];
            if (t && t.controller) t.controller.abort();
            else if (t) { t.state = 'cancelled'; emit('change', id); }
            removeFile('partial_' + id).then(() => {
                if (tasks[id]) delete tasks[id];
                emit('change', id);
            });
        },

        remove(id) {
            if (objectUrls[id]) {
                URL.revokeObjectURL(objectUrls[id]);
                delete objectUrls[id];
            }
            delete metaMap[id];
            delete tasks[id];
            return Promise.all([
                removeFile(id),
                removeFile('partial_' + id),
                removeMeta(id)
            ]).then(() => emit('change', id));
        },

        clearAll() {
            const ids = Object.keys(metaMap);
            return Promise.all(ids.map((id) => this.remove(id))).then(() => emit('storage', null));
        },

        getObjectUrl(id) {
            if (objectUrls[id]) return Promise.resolve(objectUrls[id]);
            return getFile(id).then((blob) => {
                if (!blob) return null;
                objectUrls[id] = URL.createObjectURL(blob);
                return objectUrls[id];
            });
        },

        getStorageStats() {
            const total = Object.values(metaMap).reduce((sum, m) => sum + (m.size || 0), 0);
            let quota = 0;
            let used = 0;
            const est = navigator.storage && navigator.storage.estimate
                ? navigator.storage.estimate().then((e) => {
                    quota = e.quota || 0;
                    used = e.usage || 0;
                    return { total: total, quota: quota, used: used };
                })
                : Promise.resolve({ total: total, quota: 0, used: 0 });
            return est;
        }
    };

    window.DownloadManager = DownloadManager;
})();
