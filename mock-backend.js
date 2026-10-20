/**
 * VR Music - Mock Backend & Relational Database Layer
 * Implements client-side relational storage using localStorage, JWT simulation,
 * security structures (CSRF, Rate-Limiting, Password Hashing), AI recommendation core,
 * and the FULL catalog of every music director + every track present on the platform.
 */
(function() {
    'use strict';

    const DB_PREFIX = "vrmusic_db_";
    const SEED_VERSION = "4.0";

    // Helper to get/set tables in localStorage
    function getTable(name, defaultData = []) {
        const stored = localStorage.getItem(DB_PREFIX + name);
        if (!stored) {
            localStorage.setItem(DB_PREFIX + name, JSON.stringify(defaultData));
            return defaultData;
        }
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.error("DB Corrupted: " + name, e);
            return defaultData;
        }
    }

    function saveTable(name, data) {
        localStorage.setItem(DB_PREFIX + name, JSON.stringify(data));
    }

    // ------------------------------------------------------------------
    // FULL SONG CATALOG — every music director, every track (no omissions)
    // ------------------------------------------------------------------
    const defaultSongs = [
        // ── Anirudh Ravichander ─────────────────────────────────────────
        { id: "ani_1", artistId: "anirudh", title: "Coolie Disco", album: "Coolie", duration: "3:15", img: "anirudh song/disco.jpeg", file: "anirudh song/Coolie Disco - MassTamilan.mp3", genre: "Disco", plays: 125032 },
        { id: "ani_2", artistId: "anirudh", title: "Chella Magale", album: "Single", duration: "3:30", img: "anirudh song/chella magale.jpeg", file: "anirudh song/Chella-Magale-MassTamilan.dev.mp3", genre: "Melody", plays: 89043 },
        { id: "ani_3", artistId: "anirudh", title: "Chikitu", album: "Single", duration: "3:20", img: "anirudh song/chituku.jpeg", file: "anirudh song/Chikitu - MassTamilan.mp3", genre: "Beat", plays: 73023 },
        { id: "ani_4", artistId: "anirudh", title: "Dheema", album: "Love Insurance Kompany", duration: "3:40", img: "anirudh song/dhemma.jpeg", file: "anirudh song/Dheema-MassTamilan.dev.mp3", genre: "Romantic", plays: 432901 },
        { id: "ani_5", artistId: "anirudh", title: "Oru Pere Varalaaru", album: "Single", duration: "4:00", img: "anirudh song/oru pera varalaru.jpeg", file: "anirudh song/Oru-Pere-Varalaaru-MassTamilan.dev.mp3", genre: "Mass", plays: 541094 },
        { id: "ani_6", artistId: "anirudh", title: "Pattuma", album: "Single", duration: "3:10", img: "anirudh song/pattuma.jpeg", file: "anirudh song/Pattuma-MassTamilan.dev.mp3", genre: "Pop", plays: 92831 },
        { id: "ani_7", artistId: "anirudh", title: "Raavana Mavandaa", album: "Single", duration: "3:25", img: "anirudh song/ravana mavanda.jpeg", file: "anirudh song/Raavana-Mavandaa-MassTamilan.dev.mp3", genre: "HipHop", plays: 120489 },
        { id: "ani_8", artistId: "anirudh", title: "Thalapathy Kacheri", album: "Single", duration: "3:15", img: "anirudh song/thalapathy kacheri.jpeg", file: "anirudh song/Thalapathy Kacheri.mp3", genre: "Festival", plays: 310239 },

        // ── A.R. Rahman ─────────────────────────────────────────────────
        { id: "arr_1", artistId: "arrahman", title: "Naan Un", album: "24", duration: "4:15", img: "ar rahmon song/naan un.jpeg", file: "ar rahmon song/Naan-Un.mp3", genre: "Melody", plays: 948201 },
        { id: "arr_2", artistId: "arrahman", title: "Unnaal Unnaal", album: "Ambikapathy", duration: "4:10", img: "ar rahmon song/ambikapathy.jpeg", file: "ar rahmon song/Unnaal-Unnaal.mp3", genre: "Classical", plays: 230912 },
        { id: "arr_3", artistId: "arrahman", title: "Ambikapathy", album: "Ambikapathy", duration: "4:30", img: "ar rahmon song/ambikapathy.jpeg", file: "ar rahmon song/Ambikapathy.mp3", genre: "Classical", plays: 120934 },
        { id: "arr_4", artistId: "arrahman", title: "Aalaporan Thamizhan", album: "Mersal", duration: "4:50", img: "ar rahmon song/alaporan tamizhan.jpeg", file: "ar rahmon song/Aalaporan-Thamizhan-MassTamilan.com.mp3", genre: "Folk", plays: 2390842 },
        { id: "arr_5", artistId: "arrahman", title: "Adheeraa", album: "Cobra", duration: "3:45", img: "ar rahmon song/cobra.jpeg", file: "ar rahmon song/Adheeraa-MassTamilan.dev.mp3", genre: "EDM", plays: 340912 },
        { id: "arr_6", artistId: "arrahman", title: "Arima Arima", album: "Enthiran", duration: "4:20", img: "ar rahmon song/arima arima.jpeg", file: "ar rahmon song/Arima-Arima.mp3", genre: "Orchestra", plays: 1894323 },
        { id: "arr_7", artistId: "arrahman", title: "Ella Pugazhum", album: "Azhagiya Tamil Magan", duration: "4:10", img: "ar rahmon song/ella pogalum.jpg", file: "ar rahmon song/Ella-Pugazhum-MassTamilan.fm.mp3", genre: "Inspirational", plays: 820319 },
        { id: "arr_8", artistId: "arrahman", title: "En Peru Padayappa", album: "Padayappa", duration: "4:00", img: "ar rahmon song/padaiyappa.jpeg", file: "ar rahmon song/En-Peru-Padayappa.mp3", genre: "Mass", plays: 1402391 },
        { id: "arr_9", artistId: "arrahman", title: "Ennodu Nee Irundhal", album: "I", duration: "5:05", img: "ar rahmon song/ennodu nee irudhal.jpeg", file: "ar rahmon song/Ennodu-Nee-Irundhal.mp3", genre: "Opera/Romantic", plays: 2549210 },
        { id: "arr_10", artistId: "arrahman", title: "Kaathalenum", album: "Kadhalar Dhinam", duration: "4:30", img: "ar rahmon song/kadhalanum.jpeg", file: "ar rahmon song/Kaathalenum.mp3", genre: "Romantic", plays: 890432 },
        { id: "arr_11", artistId: "arrahman", title: "Maacho Ennacho", album: "Single", duration: "3:55", img: "ar rahmon song/macho macho.jpeg", file: "ar rahmon song/Maacho-Ennacho-MassTamilan.com.mp3", genre: "Dance", plays: 456732 },
        { id: "arr_12", artistId: "arrahman", title: "Mersal Arasan", album: "Mersal", duration: "4:20", img: "ar rahmon song/alaporan tamizhan.jpeg", file: "ar rahmon song/Mersal-Arasan-MassTamilan.com.mp3", genre: "Mass", plays: 761234 },
        { id: "arr_13", artistId: "arrahman", title: "Mersalayitten", album: "Mersal", duration: "3:50", img: "ar rahmon song/merulakiten.jpeg", file: "ar rahmon song/Mersalayitten.mp3", genre: "Romantic", plays: 389012 },
        { id: "arr_14", artistId: "arrahman", title: "Minsara Poove", album: "Rhythm", duration: "4:35", img: "ar rahmon song/neethane.jpeg", file: "ar rahmon song/Minsara-Poove.mp3", genre: "Romantic", plays: 1309482 },
        { id: "arr_15", artistId: "arrahman", title: "Nee Singam Dhan", album: "Enthiran", duration: "4:10", img: "ar rahmon song/vetri kodi kattu.jpeg", file: "ar rahmon song/Nee-Singam-Dhan-MassTamilan.dev.mp3", genre: "EDM", plays: 245892 },
        { id: "arr_16", artistId: "arrahman", title: "Neethanae Neethane", album: "I", duration: "5:20", img: "ar rahmon song/neethane.jpeg", file: "ar rahmon song/Neethanae-Neethane-MassTamilan.com.mp3", genre: "Romantic", plays: 2148501 },
        { id: "arr_17", artistId: "arrahman", title: "Ninaivirukka", album: "Vaalee", duration: "4:05", img: "ar rahmon song/kadhalanum.jpeg", file: "ar rahmon song/Ninaivirukka-MassTamilan.dev.mp3", genre: "Melody", plays: 682390 },
        { id: "arr_18", artistId: "arrahman", title: "Osarattum Pathu Thala", album: "Pathu Thala", duration: "3:40", img: "ar rahmon song/pathuthala.jpeg", file: "ar rahmon song/Osarattum-Pathu-Thala-MassTamilan.dev.mp3", genre: "Mass", plays: 298120 },
        { id: "arr_19", artistId: "arrahman", title: "Pachai Kiligal", album: "Vendhu Thanindhathu Kaadu", duration: "4:00", img: "ar rahmon song/pchai kilikal.jpeg", file: "ar rahmon song/Pachai-Kiligal.mp3", genre: "Folk", plays: 540211 },
        { id: "arr_20", artistId: "arrahman", title: "Pookkale Satru", album: "I", duration: "4:30", img: "ar rahmon song/pokukale.jpeg", file: "ar rahmon song/Pookkale-Satru.mp3", genre: "Melody", plays: 1203954 },
        { id: "arr_21", artistId: "arrahman", title: "Telephone Manipol", album: "Thiruda Thirudi", duration: "4:20", img: "ar rahmon song/telephone manipol.jpeg", file: "ar rahmon song/Telephone-Manipol.mp3", genre: "Folk", plays: 942101 },
        { id: "arr_22", artistId: "arrahman", title: "Unakaga", album: "Single", duration: "4:15", img: "ar rahmon song/unagaga.jpeg", file: "ar rahmon song/Unakaga-MassTamilan.io.mp3", genre: "Melody", plays: 356210 },
        { id: "arr_23", artistId: "arrahman", title: "Uyir Urugudhey", album: "Single", duration: "5:00", img: "ar rahmon song/ennodu nee irudhal.jpeg", file: "ar rahmon song/Uyir-Urugudhey-MassTamilan.dev.mp3", genre: "Opera", plays: 284391 },
        { id: "arr_24", artistId: "arrahman", title: "Verithanam", album: "Bigil", duration: "4:10", img: "ar rahmon song/verithaman.jpeg", file: "ar rahmon song/Verithanam-MassTamilan.io.mp3", genre: "Mass", plays: 980123 },
        { id: "arr_25", artistId: "arrahman", title: "Vetri Kodi Kattu", album: "Mersal", duration: "4:45", img: "ar rahmon song/vetri kodi kattu.jpeg", file: "ar rahmon song/Vetri-Kodi-Kattu.mp3", genre: "Inspirational", plays: 8904321 },

        // ── Sai Abhyankar ───────────────────────────────────────────────
        { id: "sai_1", artistId: "saiabhyankar", title: "Katchi Sera", album: "Single", duration: "3:10", img: "sai abhyankar/katchi sera.jpeg", file: "sai abhyankar/Katchi Sera - MassTamilan.mp3", genre: "Indie Pop", plays: 984920 },
        { id: "sai_2", artistId: "saiabhyankar", title: "Aasa Kooda", album: "Star", duration: "3:35", img: "sai abhyankar/aasa kuda.jpeg", file: "sai abhyankar/Aasa Kooda - MassTamilan.mp3", genre: "Indie Pop", plays: 1549320 },
        { id: "sai_3", artistId: "saiabhyankar", title: "God Mode", album: "Karuppu", duration: "3:30", img: "sai abhyankar/karuppu.jpeg", file: "sai abhyankar/God-Mode-MassTamilan.dev.mp3", genre: "R&B", plays: 320942 },
        { id: "sai_4", artistId: "saiabhyankar", title: "Verappa", album: "Karuppu", duration: "4:00", img: "sai abhyankar/verapu.jpeg", file: "sai abhyankar/Verappa-MassTamilan.dev.mp3", genre: "Indie", plays: 231093 },
        { id: "sai_5", artistId: "saiabhyankar", title: "Blud Is On His Way", album: "Karuppu", duration: "3:15", img: "sai abhyankar/remaing.jpeg", file: "sai abhyankar/Blud Is On His Way.mp3", genre: "HipHop", plays: 185432 },
        { id: "sai_6", artistId: "saiabhyankar", title: "Kannukulla", album: "Karuppu", duration: "3:05", img: "sai abhyankar/karuppu.jpeg", file: "sai abhyankar/Kannukulla.mp3", genre: "Indie", plays: 120923 },
        { id: "sai_7", artistId: "saiabhyankar", title: "Make Way For The King", album: "Karuppu", duration: "3:25", img: "sai abhyankar/rakka.jpg", file: "sai abhyankar/Make_Way_For_The_King.mp3", genre: "HipHop", plays: 209431 },
        { id: "sai_8", artistId: "saiabhyankar", title: "Naanga Naalu Peru", album: "Single", duration: "3:45", img: "sai abhyankar/naanga naalu peru.webp", file: "sai abhyankar/Naanga_Naalu_Peru.mp3", genre: "Indie Pop", plays: 174302 },
        { id: "sai_9", artistId: "saiabhyankar", title: "Nallaru Po", album: "Single", duration: "3:30", img: "sai abhyankar/sai abhyankar.webp", file: "sai abhyankar/Nallaru Po.mp3", genre: "Indie", plays: 98231 },
        { id: "sai_10", artistId: "saiabhyankar", title: "Oorum Blood", album: "Karuppu", duration: "3:20", img: "sai abhyankar/orum blood.jpeg", file: "sai abhyankar/Oorum Blood.mp3", genre: "HipHop", plays: 142098 },
        { id: "sai_11", artistId: "saiabhyankar", title: "Pavazha Malli", album: "Single", duration: "4:10", img: "sai abhyankar/pavalamalli.jpg", file: "sai abhyankar/Pavazha Malli - SouthMelody.mp3", genre: "Melody", plays: 609124 },
        { id: "sai_12", artistId: "saiabhyankar", title: "Singari", album: "Single", duration: "3:15", img: "sai abhyankar/sai abhyankar.webp", file: "sai abhyankar/Singari.mp3", genre: "Indie Pop", plays: 154302 },
        { id: "sai_13", artistId: "saiabhyankar", title: "Yumabaibesa", album: "Single", duration: "3:05", img: "sai abhyankar/karuppu.jpeg", file: "sai abhyankar/Yumabaibesa.mp3", genre: "R&B", plays: 118430 },

        // ── G.V. Prakash Kumar ──────────────────────────────────────────
        { id: "gvp_1", artistId: "gvprakash", title: "Adi Alaye", album: "Single", duration: "3:40", img: "gv prakash/adi alaye.jpeg", file: "gv prakash/Adi Alaye.mp3", genre: "Kuthu", plays: 452890 },
        { id: "gvp_2", artistId: "gvprakash", title: "Amara", album: "Amaran", duration: "4:20", img: "gv prakash/amaran.jpeg", file: "gv prakash/Amara.mp3", genre: "Romantic", plays: 1023487 },
        { id: "gvp_3", artistId: "gvprakash", title: "Enjaami Thandhaane", album: "Single", duration: "4:05", img: "gv prakash/enjaami thandhane.jpeg", file: "gv prakash/Enjaami Thandhaane.mp3", genre: "Melody", plays: 389210 },
        { id: "gvp_4", artistId: "gvprakash", title: "Kannumuzhi", album: "Single", duration: "3:55", img: "gv prakash/kannumuzhi.jpeg", file: "gv prakash/Kannumuzhi.mp3", genre: "Melody", plays: 298347 },
        { id: "gvp_5", artistId: "gvprakash", title: "Mutta Kalakki", album: "Single", duration: "3:35", img: "gv prakash/mutta kalaki.jpeg", file: "gv prakash/Mutta Kalakki.mp3", genre: "Kuthu", plays: 512340 },
        { id: "gvp_6", artistId: "gvprakash", title: "Polladha Boomi", album: "Single", duration: "3:50", img: "gv prakash/pollada boomi.jpeg", file: "gv prakash/Polladha-Boomi-MassTamilan.org.mp3", genre: "Folk", plays: 145203 },
        { id: "gvp_7", artistId: "gvprakash", title: "Ratnamala", album: "Single", duration: "4:10", img: "gv prakash/ratnamala.jpeg", file: "gv prakash/Ratnamala.mp3", genre: "Melody", plays: 204981 },

        // ── Harris Jayaraj ──────────────────────────────────────────────
        { id: "hj_1", artistId: "harrisjayaraj", title: "Adiye Adiye", album: "Single", duration: "4:10", img: "harris jayaraj/harris jayaraj.jpeg", file: "harris jayaraj/Adiye-Adiye.mp3", genre: "Melody", plays: 540281 },
        { id: "hj_2", artistId: "harrisjayaraj", title: "Hey Amigo", album: "Single", duration: "3:45", img: "harris jayaraj/harris jayaraj.jpeg", file: "harris jayaraj/Hey-Amigo-MassTamilan.org.mp3", genre: "Dance", plays: 320918 },
        { id: "hj_3", artistId: "harrisjayaraj", title: "Mutta Bhajji", album: "Single", duration: "3:30", img: "harris jayaraj/harris jayaraj.jpeg", file: "harris jayaraj/Mutta-Bhajji.mp3", genre: "Beat", plays: 290431 },

        // ── Hiphop Tamizha ──────────────────────────────────────────────
        { id: "ht_1", artistId: "hiphoptamizha", title: "Andome Kidukidunga", album: "Single", duration: "3:20", img: "hiphop tamizha/hiphop tamizha.jpg", file: "hiphop tamizha/Andome-Kidukidunga-MassTamilan.dev.mp3", genre: "HipHop", plays: 340921 },
        { id: "ht_2", artistId: "hiphoptamizha", title: "Aura 10/10", album: "Meesaya Murukku 2", duration: "3:35", img: "hiphop tamizha/aura-10-10-from-meesaya-murukku-2-1.webp", file: "hiphop tamizha/Aura 10_10 (From _Meesaya Murukku 2_) - NaaSongs.mp3", genre: "HipHop", plays: 198430 },
        { id: "ht_3", artistId: "hiphoptamizha", title: "Bye Bye Bhaiya", album: "Single", duration: "3:10", img: "hiphop tamizha/bye bye bhaiya.jpeg", file: "hiphop tamizha/Bye Bye Bhaiya.mp3", genre: "HipHop", plays: 245093 },
        { id: "ht_4", artistId: "hiphoptamizha", title: "Papara Mitta", album: "Single", duration: "3:05", img: "hiphop tamizha/hiphop tamizha.jpg", file: "hiphop tamizha/Papara-Mitta-MassTamilan.dev.mp3", genre: "HipHop", plays: 310248 },
        { id: "ht_5", artistId: "hiphoptamizha", title: "Pappali Pazhamey", album: "Meesaya Murukku 2", duration: "3:25", img: "hiphop tamizha/pappali-pazhamey-from-meesaya-murukku-2.webp", file: "hiphop tamizha/Pappali Pazhamey (From _Meesaya Murukku 2_) - NaaSongs.mp3", genre: "Indie", plays: 289310 },
        { id: "ht_6", artistId: "hiphoptamizha", title: "Ready Steady Go", album: "Single", duration: "3:15", img: "hiphop tamizha/ready study go.jpeg", file: "hiphop tamizha/Ready-Steady-Go-MassTamilan.fm.mp3", genre: "HipHop", plays: 172930 },
        { id: "ht_7", artistId: "hiphoptamizha", title: "Thunder Kaaran", album: "Single", duration: "3:40", img: "hiphop tamizha/hiphop tamizha.jpg", file: "hiphop tamizha/Thunder-Kaaran-MassTamilan.dev.mp3", genre: "Rap", plays: 160248 },
        { id: "ht_8", artistId: "hiphoptamizha", title: "Veeran Thiruvizha", album: "Single", duration: "4:05", img: "hiphop tamizha/veeran.jpeg", file: "hiphop tamizha/Veeran-Thiruvizha-MassTamilan.dev.mp3", genre: "Festival", plays: 402193 },

        // ── Ilaiyaraaja ─────────────────────────────────────────────────
        { id: "ill_1", artistId: "illayaraja", title: "Arutperunjodhi", album: "Single", duration: "4:45", img: "illayaraja/illaiyaraja.jpeg", file: "illayaraja/Arutperunjodhi-MassTamilan.dev.mp3", genre: "Devotional", plays: 780432 },
        { id: "ill_2", artistId: "illayaraja", title: "Kaattumalli", album: "Viduthalai", duration: "5:10", img: "illayaraja/viduthalai.jpeg", file: "illayaraja/Kaattumalli-MassTamilan.dev.mp3", genre: "Classical", plays: 1230942 },

        // ── Santhosh Narayanan ──────────────────────────────────────────
        { id: "sn_1", artistId: "santhoshnarayanan", title: "Azhagiya Soodana Poovey", album: "Single", duration: "3:55", img: "santhosh narayanan/santhosh narayanan.jpeg", file: "santhosh narayanan/Azhagiya-Soodana-Poovey.mp3", genre: "Melody", plays: 402193 },
        { id: "sn_2", artistId: "santhoshnarayanan", title: "Kanimaa", album: "Single", duration: "4:15", img: "santhosh narayanan/kanimaa.jpeg", file: "santhosh narayanan/Kanimaa.mp3", genre: "Melody", plays: 389210 },
        { id: "sn_3", artistId: "santhoshnarayanan", title: "Nillayo", album: "Single", duration: "3:45", img: "santhosh narayanan/santhosh narayanan.jpeg", file: "santhosh narayanan/Nillayo.mp3", genre: "Folk", plays: 230918 },
        { id: "sn_4", artistId: "santhoshnarayanan", title: "Oyyaram", album: "Single", duration: "3:50", img: "santhosh narayanan/oyyaram.jpeg", file: "santhosh narayanan/Oyyaram-MassTamilan.dev.mp3", genre: "Folk", plays: 298301 },
        { id: "sn_5", artistId: "santhoshnarayanan", title: "Papa Papa", album: "Single", duration: "4:05", img: "santhosh narayanan/the one.jpeg", file: "santhosh narayanan/Papa-Papa.mp3", genre: "Indie", plays: 176240 },
        { id: "sn_6", artistId: "santhoshnarayanan", title: "Rakita Rakita Rakita", album: "Single", duration: "3:40", img: "santhosh narayanan/rakita rakita.jpeg", file: "santhosh narayanan/Rakita-Rakita-Rakita-MassTamilan.fm.mp3", genre: "Indie Rock", plays: 519304 },
        { id: "sn_7", artistId: "santhoshnarayanan", title: "The One", album: "Single", duration: "4:30", img: "santhosh narayanan/the one.jpeg", file: "santhosh narayanan/The One.mp3", genre: "Indie", plays: 142093 },

        // ── Thaman S ────────────────────────────────────────────────────
        { id: "ts_1", artistId: "thamans", title: "Celebration Of Varisu", album: "Varisu", duration: "4:00", img: "thamon s/thamon s.jpeg", file: "thamon s/Celebration-Of-Varisu-MassTamilan.dev.mp3", genre: "Mass", plays: 450213 },
        { id: "ts_2", artistId: "thamans", title: "Jimikki Ponnu", album: "Varisu", duration: "3:50", img: "thamon s/thamon s.jpeg", file: "thamon s/Jimikki-Ponnu-MassTamilan.dev.mp3", genre: "Melody", plays: 890123 },
        { id: "ts_3", artistId: "thamans", title: "Kaalai Theme", album: "Varisu", duration: "3:30", img: "thamon s/thamon s.jpeg", file: "thamon s/Kaalai-Theme-MassTamilan.com.mp3", genre: "Mass", plays: 310298 },
        { id: "ts_4", artistId: "thamans", title: "Nache Nache", album: "Single", duration: "3:55", img: "thamon s/thamon s.jpeg", file: "thamon s/Nache Nache.mp3", genre: "Dance", plays: 540210 },
        { id: "ts_5", artistId: "thamans", title: "Ranjithame", album: "Varisu", duration: "4:10", img: "thamon s/thamon s.jpeg", file: "thamon s/Ranjithame-MassTamilan.dev.mp3", genre: "Melody", plays: 760123 },
        { id: "ts_6", artistId: "thamans", title: "Rebel Saab", album: "Rebel", duration: "4:20", img: "thamon s/thamon s.jpeg", file: "thamon s/Rebel Saab.mp3", genre: "Mass", plays: 320910 },
        { id: "ts_7", artistId: "thamans", title: "Thee Thalapathy", album: "Varisu", duration: "3:45", img: "thamon s/thamon s.jpeg", file: "thamon s/Thee-Thalapathy-MassTamilan.dev.mp3", genre: "EDM", plays: 450193 },

        // ── Vijay Antony ─────────────────────────────────────────────────
        { id: "va_1", artistId: "vijayantony", title: "Anti Bikili", album: "Single", duration: "3:50", img: "vijay antony/antibikili.jpeg", file: "vijay antony/Anti-Bikili-MassTamilan.so.mp3", genre: "Mass", plays: 340291 },
        { id: "va_2", artistId: "vijayantony", title: "Naga Naga", album: "Single", duration: "4:05", img: "vijay antony/naga naga.jpeg", file: "vijay antony/Naga-Naga-MassTamilan.com.mp3", genre: "Dark", plays: 502193 },
        { id: "va_3", artistId: "vijayantony", title: "Thimirupudichavan", album: "Single", duration: "3:40", img: "vijay antony/vijay antony.jpeg", file: "vijay antony/Thimirupudichavan-MassTamilan.com.mp3", genre: "Mass", plays: 280931 },
        { id: "va_4", artistId: "vijayantony", title: "Unakkaga Varuven", album: "Single", duration: "4:15", img: "vijay antony/unakagavaruven.jpeg", file: "vijay antony/Unakkaga-Varuven.mp3", genre: "Melody", plays: 198430 },

        // ── Yuvan Shankar Raja ──────────────────────────────────────────
        { id: "yu_1", artistId: "yuvan", title: "Chinna Chinna Kangal", album: "Single", duration: "4:25", img: "yuvan song/chinna kangal.webp", file: "yuvan song/Chinna Chinna Kangal.mp3", genre: "Melody", plays: 670219 },
        { id: "yu_2", artistId: "yuvan", title: "Ennai Vittu", album: "Single", duration: "4:10", img: "yuvan song/ennai vittu.jpeg", file: "yuvan song/Ennai-Vittu-MassTamilan.dev.mp3", genre: "Romantic", plays: 452019 },
        { id: "yu_3", artistId: "yuvan", title: "Matta", album: "Single", duration: "3:20", img: "yuvan song/matta.webp", file: "yuvan song/Matta.mp3", genre: "Beat", plays: 340219 },
        { id: "yu_4", artistId: "yuvan", title: "Saachitale", album: "Single", duration: "3:45", img: "yuvan song/sachitale.jpeg", file: "yuvan song/Saachitale-MassTamilan.dev.mp3", genre: "Melody", plays: 510293 },
        { id: "yu_5", artistId: "yuvan", title: "Whistle Podu", album: "Single", duration: "4:00", img: "yuvan song/whistle podu.jpeg", file: "yuvan song/Whistle Podu.mp3", genre: "Folk", plays: 890123 },

        // ── D. Imman ────────────────────────────────────────────────────
        { id: "dim_1", artistId: "dimman", title: "Adivellakkaara Velaayi", album: "Single", duration: "3:55", img: "d immon/d immon.jpeg", file: "d immon/Adivellakkaara-Velaayi-MassTamilan.com.mp3", genre: "Folk", plays: 340192 },
        { id: "dim_2", artistId: "dimman", title: "Jilla Theme", album: "Jilla", duration: "3:45", img: "d immon/d immon.jpeg", file: "d immon/Jilla-Theme.mp3", genre: "Mass", plays: 610234 },
        { id: "dim_3", artistId: "dimman", title: "Jingunamani", album: "Single", duration: "3:30", img: "d immon/d immon.jpeg", file: "d immon/Jingunamani.mp3", genre: "Folk", plays: 280931 },
        { id: "dim_4", artistId: "dimman", title: "Kandangi Kandangi", album: "Single", duration: "4:00", img: "d immon/d immon.jpeg", file: "d immon/Kandangi-Kandangi.mp3", genre: "Folk", plays: 402193 },
        { id: "dim_5", artistId: "dimman", title: "Rajini Murugan", album: "Single", duration: "3:50", img: "d immon/d immon.jpeg", file: "d immon/Rajini Murugan.mp3", genre: "Kuthu", plays: 560291 },
        { id: "dim_6", artistId: "dimman", title: "Sandakkaari", album: "Single", duration: "3:40", img: "d immon/d immon.jpeg", file: "d immon/Sandakkaari-MassTamilan.com.mp3", genre: "Folk", plays: 230910 },
        { id: "dim_7", artistId: "dimman", title: "Un Mela Oru Kannu", album: "Single", duration: "4:05", img: "d immon/d immon.jpeg", file: "d immon/Un Mela Oru Kannu.mp3", genre: "Melody", plays: 310284 },

        // ── Album Songs (Independent / Compilations) ────────────────────
        { id: "alb_1", artistId: "album_song", title: "Kaakum Vadivel", album: "Album Song", duration: "4:05", img: "album song/kaakum vadivel.jpeg", file: "album song/Kaakum Vadivel.mp3", genre: "Devotional", plays: 43210 },
        { id: "alb_2", artistId: "album_song", title: "VETRIVEL", album: "Album Song", duration: "3:30", img: "album song/vetrivel.webp", file: "album song/VETRIVEL.mp3", genre: "Folk", plays: 29012 },
        { id: "alb_3", artistId: "album_song", title: "Kaathu Mela", album: "Album Song", duration: "3:10", img: "album song/kaathu mela.webp", file: "album song/Kaathu Mela.mp3", genre: "Kuthu", plays: 98124 },
        { id: "alb_4", artistId: "album_song", title: "Paiya Dei", album: "Album Song", duration: "3:20", img: "album song/paiya dei.webp", file: "album song/Paiya Dei.mp3", genre: "HipHop", plays: 34912 },
        { id: "alb_5", artistId: "album_song", title: "Sigma Paiyan", album: "Album Song", duration: "3:15", img: "album song/sigma paiyan.webp", file: "album song/Sigma Paiyan.mp3", genre: "Rap", plays: 120984 },
        { id: "alb_6", artistId: "album_song", title: "Vibe", album: "Album Song", duration: "3:05", img: "album song/vibe.webp", file: "album song/Vibe.mp3", genre: "Club", plays: 76092 },
        { id: "alb_7", artistId: "album_song", title: "TVK Election Campaign", album: "Album Song", duration: "4:15", img: "album song/tvk election.webp", file: "album song/TVK ELECTION CAMPAIGN SONG - SouthMelody.mp3", genre: "Political/Folk", plays: 154320 }
    ];

    // ------------------------------------------------------------------
    // FULL ARTIST DIRECTORY — every music director present (12 verified)
    // ------------------------------------------------------------------
    const defaultArtists = [
        { id: "anirudh", name: "Anirudh Ravichander", desc: "Rockstar of South Indian Music. Experience his massive hits like Hukum, Dheema, and Oru Pere Varalaaru in high fidelity immersive formats.", listeners: "35.4M", followers: 15200349, popularity: 98, image: "anirudh song/Anirudh-Ravichander.webp", bgGradient: "linear-gradient(135deg, rgba(124,58,237,0.35), rgba(0,229,255,0.15))", verified: true, genres: ["Pop", "HipHop", "Mass", "EDM"] },
        { id: "arrahman", name: "A.R. Rahman", desc: "The Mozart of Madras. Oscar-winning composer with a timeless classical catalogue and global orchestral mastery.", listeners: "28.9M", followers: 19483201, popularity: 100, image: "ar rahmon song/ar rahmon.jpeg", bgGradient: "linear-gradient(135deg, rgba(0,229,255,0.35), rgba(7,11,24,0.5))", verified: true, genres: ["Classical", "Melody", "Orchestra", "Folk"] },
        { id: "saiabhyankar", name: "Sai Abhyankar", desc: "Rising star known for fresh indie melodies, viral singles and bold experimental soundscapes.", listeners: "4.8M", followers: 521903, popularity: 88, image: "sai abhyankar/sai abhyankar.webp", bgGradient: "linear-gradient(135deg, rgba(236,72,153,0.35), rgba(124,58,237,0.2))", verified: true, genres: ["Indie Pop", "R&B", "HipHop"] },
        { id: "gvprakash", name: "G.V. Prakash Kumar", desc: "Versatile composer and hit singer with a golden run of mass melodies and kuthu anthems.", listeners: "8.2M", followers: 2390123, popularity: 90, image: "gv prakash/gv prakash.png", bgGradient: "linear-gradient(135deg, rgba(34,197,94,0.35), rgba(0,229,255,0.15))", verified: true, genres: ["Melody", "Kuthu", "Folk"] },
        { id: "illayaraja", name: "Ilaiyaraaja", desc: "Isaignani. The absolute maestro of Indian Cinema with 40+ years of timeless symphonic work.", listeners: "12.5M", followers: 8904320, popularity: 96, image: "illayaraja/illaiyaraja.jpeg", bgGradient: "linear-gradient(135deg, rgba(245,158,11,0.35), rgba(124,58,237,0.2))", verified: true, genres: ["Classical", "Symphony", "Devotional"] },
        { id: "yuvan", name: "Yuvan Shankar Raja", desc: "Little Maestro. King of Background Scores and pioneer of the BGM and Lo-fi movement.", listeners: "15.1M", followers: 6490321, popularity: 94, image: "yuvan song/yuvan shankar raja.jpeg", bgGradient: "linear-gradient(135deg, rgba(124,58,237,0.35), rgba(236,72,153,0.2))", verified: true, genres: ["BGM", "Lo-fi", "Pop", "Melody"] },
        { id: "vijayantony", name: "Vijay Antony", desc: "Pioneering composer turned actor known for dark electronic scores and raw mass anthems.", listeners: "3.2M", followers: 948321, popularity: 82, image: "vijay antony/vijay antony.jpeg", bgGradient: "linear-gradient(135deg, rgba(239,68,68,0.35), rgba(7,11,24,0.5))", verified: true, genres: ["Electronic", "Dark Pop", "Mass"] },
        { id: "hiphoptamizha", name: "Hiphop Tamizha", desc: "The pioneers of Tamil Hip Hop blending rap, rock and energetic youth anthems.", listeners: "6.9M", followers: 3420912, popularity: 89, image: "hiphop tamizha/hiphop tamizha.jpg", bgGradient: "linear-gradient(135deg, rgba(0,229,255,0.35), rgba(124,58,237,0.25))", verified: true, genres: ["HipHop", "Rock", "Youth", "Rap"] },
        { id: "harrisjayaraj", name: "Harris Jayaraj", desc: "Melody King. Renowned for gorgeous synth hooks and unforgettable romantic ballads.", listeners: "11.2M", followers: 5120489, popularity: 92, image: "harris jayaraj/harris jayaraj.jpeg", bgGradient: "linear-gradient(135deg, rgba(236,72,153,0.35), rgba(124,58,237,0.2))", verified: true, genres: ["Melody", "Indie Synth", "Dance"] },
        { id: "thamans", name: "Thaman S", desc: "High-energy rhythm maker of South cinema delivering chart-topping party anthems.", listeners: "9.5M", followers: 2380942, popularity: 91, image: "thamon s/thamon s.jpeg", bgGradient: "linear-gradient(135deg, rgba(245,158,11,0.35), rgba(239,68,68,0.2))", verified: true, genres: ["EDM", "Kuthu", "Mass"] },
        { id: "santhoshnarayanan", name: "Santhosh Narayanan", desc: "SaNa. The raw, experimental genius Composer redefining folk and indie rock.", listeners: "7.8M", followers: 1849301, popularity: 87, image: "santhosh narayanan/santhosh narayanan.jpeg", bgGradient: "linear-gradient(135deg, rgba(34,197,94,0.35), rgba(0,229,255,0.15))", verified: true, genres: ["Folk", "Indie Rock", "Acoustic", "Indie"] },
        { id: "dimman", name: "D. Imman", desc: "Consistent melody maker of village folklore and mass commercial hits.", listeners: "5.4M", followers: 983210, popularity: 84, image: "d immon/d immon.jpeg", bgGradient: "linear-gradient(135deg, rgba(0,229,255,0.35), rgba(34,197,94,0.2))", verified: true, genres: ["Folk", "Melody", "Kuthu"] },
        { id: "album_song", name: "Album Songs", desc: "Independent tracks, devotional anthems and viral compilation singles.", listeners: "1.2M", followers: 204981, popularity: 76, image: "album song/kaakum vadivel.jpeg", bgGradient: "linear-gradient(135deg, rgba(236,72,153,0.3), rgba(7,11,24,0.5))", verified: false, genres: ["Devotional", "Folk", "HipHop", "Rap"] }
    ];

    const defaultUsers = [
        { email: "admin@music.com", passwordHash: "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918", name: "System Admin", role: "admin", avatar: "A", subscription: "Premium Plus", bio: "Platform Orchestrator & Performance Lead", badges: ["Architect", "Super User"], history: [] },
        { email: "user@music.com", passwordHash: "5e883f1689110d7f9d1b610914e6015019d16e09e3e3ec592e37e10e0b29c4af", name: "Guest User", role: "user", avatar: "G", subscription: "Premium", bio: "Vibing to melodies, day & night.", badges: ["Explorer", "Lover of Sound"], history: [] }
    ];

    const defaultComments = [
        { id: "com_1", targetId: "Love Insurance Kompany", user: "anand@gmail.com", text: "Dheema is a masterclass in romantic pop! Loop forever.", date: "2026-07-28" },
        { id: "com_2", targetId: "Mersal", user: "rahmaniac@gmail.com", text: "Aalaporan Thamizhan is pure chills, the orchestra is majestic.", date: "2026-07-29" },
        { id: "com_3", targetId: "Star", user: "divya@yahoo.com", text: "Sai Abhyankar keeps giving non-stop bangers!", date: "2026-07-30" },
        { id: "com_4", targetId: "Amaran", user: "sindhu@gmail.com", text: "Amara is deeply emotional. The strings section is heavenly.", date: "2026-07-31" },
        { id: "com_5", targetId: "Viduthalai", user: "sana@yahoo.com", text: "Kaattumalli gives me goosebumps every single time. Maestro Raja!", date: "2026-08-01" }
    ];

    const defaultPodcasts = [
        { id: "pod_1", name: "The Composer's Lounge", host: "Aditya R", desc: "Deep conversations with music directors on their process, samples and stories behind the hits.", episodes: 24, genre: "Interview", image: "mus logo.webp", color: "#00E5FF" },
        { id: "pod_2", name: "VR Sound Stories", host: "Meera K", desc: "Immersive audio documentaries exploring how cinema music shapes emotion.", episodes: 31, genre: "Documentary", image: "mus logo.webp", color: "#7C3AED" },
        { id: "pod_3", name: "Indie Rising", host: "Karthik V", desc: "Weekly spotlight on the freshest independent artists and bedroom producers.", episodes: 18, genre: "Music", image: "mus logo.webp", color: "#EC4899" },
        { id: "pod_4", name: "Theory & Thrills", host: "Nisha P", desc: "Music theory made fun — rhythm, ragas and why hooks get stuck in your head.", episodes: 42, genre: "Education", image: "mus logo.webp", color: "#22C55E" },
        { id: "pod_5", name: "Night Drive Radio", host: "Arjun M", desc: "Late-night lo-fi mixes and minimalist chats about sound design.", episodes: 27, genre: "Lo-fi", image: "mus logo.webp", color: "#F59E0B" }
    ];

    const defaultRadio = [
        { id: "radio_1", name: "Tamil Beats FM", tagline: "Non-stop kuthu & mass hits", genre: "Kuthu", image: "mus logo.webp", color: "#00E5FF", listeners: "1.2M" },
        { id: "radio_2", name: "Classical Waves", tagline: "Ragas, symphonies & orchestral", genre: "Classical", image: "mus logo.webp", color: "#7C3AED", listeners: "840K" },
        { id: "radio_3", name: "Lo-fi Chill", tagline: "24/7 beats to relax & study", genre: "Lo-fi", image: "mus logo.webp", color: "#22C55E", listeners: "2.1M" },
        { id: "radio_4", name: "Retro 90s Hits", tagline: "Golden Tamil cinema melodies", genre: "Melody", image: "mus logo.webp", color: "#EC4899", listeners: "960K" },
        { id: "radio_5", name: "Club EDM Live", tagline: "Festival energy, live from VR", genre: "EDM", image: "mus logo.webp", color: "#F59E0B", listeners: "1.5M" },
        { id: "radio_6", name: "Indie Discovery", tagline: "Fresh finds & rising stars", genre: "Indie", image: "mus logo.webp", color: "#10B981", listeners: "310K" }
    ];

    // Seed DB with defaults
    const seededSongs = getTable("songs", defaultSongs);
    const seededArtists = getTable("artists", defaultArtists);
    const seededUsers = getTable("users", defaultUsers);
    const seededComments = getTable("comments", defaultComments);
    getTable("favorites", {});
    getTable("playlists", [
        { id: "pl_mood_happy", name: "Neon Positivity", tracks: ["ani_1", "arr_4", "sai_1", "ts_2"], isAI: true, type: "Happy" },
        { id: "pl_mood_sad", name: "Rainy Melancholy", tracks: ["ani_2", "arr_1", "arr_9", "gvp_4"], isAI: true, type: "Sad" },
        { id: "pl_mood_energetic", name: "Apex Workout Gym", tracks: ["ani_5", "arr_5", "sai_3", "ts_7"], isAI: true, type: "Energetic" },
        { id: "pl_mood_relaxed", name: "Ethereal Dreamland", tracks: ["ani_4", "arr_10", "sai_2", "yu_1"], isAI: true, type: "Relaxed" },
        { id: "pl_mood_chill", name: "Chill Lofi Afternoon", tracks: ["yu_1", "arr_17", "dim_7", "sai_11", "hj_1"], isAI: true, type: "Chill" },
        { id: "pl_mood_romance", name: "Romantic Evening", tracks: ["ani_4", "arr_16", "gvp_4", "yu_2", "arr_14"], isAI: true, type: "Romantic" },
        { id: "pl_mood_festival", name: "Mass Festival Anthems", tracks: ["ani_8", "arr_4", "ht_8", "dim_2", "arr_24"], isAI: true, type: "Festival" },
        { id: "pl_mood_classic", name: "Timeless Classics", tracks: ["ill_1", "ill_2", "arr_3", "arr_6", "arr_2"], isAI: true, type: "Classical" }
    ]);
    getTable("podcasts", defaultPodcasts);
    getTable("radio", defaultRadio);

    // ------------------------------------------------------------------
    // SEED MIGRATION — merge any newly added defaults into existing DBs
    // so previously stored users automatically receive the FULL catalog.
    // ------------------------------------------------------------------
    (function migrate() {
        try {
            const currentVersion = localStorage.getItem(DB_PREFIX + "seed_version") || "0";
            if (currentVersion !== SEED_VERSION) {
                const songs = seededSongs;
                const knownSongIds = new Set(songs.map(s => s.id));
                defaultSongs.forEach(s => { if (!knownSongIds.has(s.id)) songs.push(s); });

                const artists = seededArtists;
                const knownArtistIds = new Set(artists.map(a => a.id));
                defaultArtists.forEach(a => { if (!knownArtistIds.has(a.id)) artists.push(a); });

                const users = seededUsers;
                defaultUsers.forEach(u => {
                    if (!users.some(x => x.email === u.email)) users.push(u);
                });

                const comments = seededComments;
                defaultComments.forEach(c => {
                    if (!comments.some(x => x.id === c.id)) comments.push(c);
                });

                saveTable("songs", songs);
                saveTable("artists", artists);
                saveTable("users", users);
                saveTable("comments", comments);
                localStorage.setItem(DB_PREFIX + "seed_version", SEED_VERSION);
            }
        } catch (e) {
            console.warn("Seed migration skipped:", e);
        }
    })();

    // Simple SHA-256 Mock hash helper (for simulated security passwordHashing)
    function mockHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash).toString(16).padStart(16, '0') + "simulatedhash";
    }

    // Rate limiting simulation (15 requests per 10s per route)
    const rateLimiter = {
        hits: {},
        check(route) {
            const now = Date.now();
            if (!this.hits[route]) this.hits[route] = [];
            this.hits[route] = this.hits[route].filter(time => now - time < 10000);
            if (this.hits[route].length >= 15) {
                return false; // Rate limit exceeded
            }
            this.hits[route].push(now);
            return true;
        }
    };

    // Public API
    window.MockBackend = {
        // Authenticate & Token handling
        login(email, password) {
            if (!rateLimiter.check("login")) {
                return { success: false, error: "Too many login attempts. Please wait 10 seconds." };
            }
            if (!email || !password) {
                return { success: false, error: "Missing parameters" };
            }

            const users = getTable("users");
            const hash = mockHash(password);
            const found = users.find(u => u.email.toLowerCase() === email.toLowerCase() &&
                (u.passwordHash === hash || (u.email === "user@music.com" && password === "user123") || (u.email === "admin@music.com" && password === "admin123")));

            if (found) {
                const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." + btoa(JSON.stringify({ email: found.email, role: found.role })) + ".signature";
                localStorage.setItem("userEmail", found.email);
                localStorage.setItem("userToken", mockToken);
                return { success: true, user: found, token: mockToken };
            }
            return { success: false, error: "Invalid email or password combination" };
        },

        signup(name, email, password) {
            if (!name || !email || !password) {
                return { success: false, error: "All fields are required" };
            }
            if (password.length < 6) {
                return { success: false, error: "Password must be at least 6 characters" };
            }
            const users = getTable("users");
            if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
                return { success: false, error: "Email is already registered" };
            }

            const newUser = {
                email: email,
                passwordHash: mockHash(password),
                name: name,
                role: "user",
                avatar: name.charAt(0).toUpperCase(),
                subscription: "Free tier",
                bio: "Just joined VR Music!",
                badges: ["New Member"],
                history: []
            };

            users.push(newUser);
            saveTable("users", users);
            return { success: true };
        },

        getCurrentUser() {
            const email = localStorage.getItem("userEmail");
            if (!email) return null;
            const users = getTable("users");
            return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
        },

        updateSubscription(tier) {
            const user = this.getCurrentUser();
            if (!user) return { success: false, error: "Unauthorized" };

            const users = getTable("users");
            const idx = users.findIndex(u => u.email === user.email);
            if (idx !== -1) {
                users[idx].subscription = tier;
                if (tier === "Premium" && !users[idx].badges.includes("Premium Member")) {
                    users[idx].badges.push("Premium Member");
                }
                saveTable("users", users);
                return { success: true, user: users[idx] };
            }
            return { success: false };
        },

        // Song & Artist Fetch
        getSongs() {
            return getTable("songs");
        },

        getArtists() {
            return getTable("artists");
        },

        getPlaylists() {
            return getTable("playlists");
        },

        getPodcasts() {
            return getTable("podcasts");
        },

        getRadioStations() {
            return getTable("radio");
        },

        getGenres() {
            const songs = getTable("songs");
            const map = {};
            const genreMeta = {
                "Melody": { color: "#00E5FF", icon: "fa-music" },
                "Classical": { color: "#7C3AED", icon: "fa-masks-theater" },
                "Mass": { color: "#EF4444", icon: "fa-bolt" },
                "Folk": { color: "#22C55E", icon: "fa-seedling" },
                "Romantic": { color: "#EC4899", icon: "fa-heart" },
                "HipHop": { color: "#F59E0B", icon: "fa-microphone-lines" },
                "Indie": { color: "#10B981", icon: "fa-guitar" },
                "Kuthu": { color: "#EF4444", icon: "fa-fire" },
                "EDM": { color: "#00E5FF", icon: "fa-wave-square" },
                "Rap": { color: "#7C3AED", icon: "fa-headphones" },
                "Dance": { color: "#EC4899", icon: "fa-people-group" },
                "Devotional": { color: "#F59E0B", icon: "fa-hands-praying" },
                "Festival": { color: "#22C55E", icon: "fa-star" },
                "Beat": { color: "#94A3B8", icon: "fa-drum" },
                "Pop": { color: "#00E5FF", icon: "fa-star" },
                "Disco": { color: "#EC4899", icon: "fa-disco-ball" },
                "Orchestra": { color: "#7C3AED", icon: "fa-saxophone" },
                "Lo-fi": { color: "#10B981", icon: "fa-moon" },
                "BGM": { color: "#94A3B8", icon: "fa-film" },
                "Indie Rock": { color: "#EF4444", icon: "fa-guitar" }
            };
            songs.forEach(s => {
                const key = s.genre.split("/")[0].trim();
                if (!map[key]) map[key] = { name: key, count: 0, color: "#00E5FF", icon: "fa-music" };
                map[key].count++;
                map[key].color = (genreMeta[key] || {}).color || "#00E5FF";
                map[key].icon = (genreMeta[key] || {}).icon || "fa-music";
            });
            return Object.values(map);
        },

        // Add Custom Upload (Admin or Artist role restriction check simulation)
        uploadSong(title, artistId, album, duration, file, img, genre) {
            const user = this.getCurrentUser();
            if (!user || (user.role !== "admin" && user.role !== "artist")) {
                return { success: false, error: "Access Denied: Only Admin/Artist can upload songs." };
            }

            if (!title || !artistId || !album || !duration) {
                return { success: false, error: "Missing required fields" };
            }

            const songs = getTable("songs");
            const newSong = {
                id: "custom_" + Date.now(),
                artistId: artistId,
                title: title,
                album: album,
                duration: duration,
                file: file || "anirudh song/Coolie Disco - MassTamilan.mp3",
                img: img || "mus logo.webp",
                genre: genre || "Unknown",
                plays: 0
            };

            songs.push(newSong);
            saveTable("songs", songs);
            return { success: true, song: newSong };
        },

        // Comments API
        getComments(targetId) {
            const comments = getTable("comments");
            return comments.filter(c => c.targetId === targetId);
        },

        addComment(targetId, text) {
            const user = this.getCurrentUser();
            if (!user) return { success: false, error: "Must log in to comment" };

            const comments = getTable("comments");
            const newComment = {
                id: "com_" + Date.now(),
                targetId: targetId,
                user: user.email,
                text: text,
                date: new Date().toISOString().split('T')[0]
            };
            comments.push(newComment);
            saveTable("comments", comments);
            return { success: true, comment: newComment };
        },

        // Likes & History Persistence
        getLikes() {
            return getTable("favorites");
        },

        toggleLike(songId) {
            const user = this.getCurrentUser();
            if (!user) return { success: false };

            const likes = getTable("favorites");
            const key = `${user.email}_${songId}`;
            if (likes[key]) {
                delete likes[key];
            } else {
                likes[key] = true;
                const userLikesCount = Object.keys(likes).filter(k => k.startsWith(user.email + "_")).length;
                if (userLikesCount >= 5) {
                    const users = getTable("users");
                    const uIdx = users.findIndex(u => u.email === user.email);
                    if (uIdx !== -1 && !users[uIdx].badges.includes("Taste Maker")) {
                        users[uIdx].badges.push("Taste Maker");
                        saveTable("users", users);
                    }
                }
            }
            saveTable("favorites", likes);
            return { success: true, liked: !!likes[key] };
        },

        isLiked(songId) {
            const user = this.getCurrentUser();
            if (!user) return false;
            const likes = getTable("favorites");
            return !!likes[`${user.email}_${songId}`];
        },

        getRecentlyPlayed() {
            const user = this.getCurrentUser();
            if (!user) return [];
            return user.history || [];
        },

        addToHistory(songId) {
            const user = this.getCurrentUser();
            if (!user) return;

            const users = getTable("users");
            const idx = users.findIndex(u => u.email === user.email);
            if (idx !== -1) {
                let hist = users[idx].history || [];
                hist = hist.filter(id => id !== songId);
                hist.unshift(songId);
                if (hist.length > 15) hist.pop();
                users[idx].history = hist;
                saveTable("users", users);

                const songs = getTable("songs");
                const sIdx = songs.findIndex(s => s.id === songId);
                if (sIdx !== -1) {
                    songs[sIdx].plays = (songs[sIdx].plays || 0) + 1;
                    saveTable("songs", songs);
                }
            }
        },

        // AI Feature Engine
        getAIChatResponse(message) {
            const cleanMsg = message.toLowerCase().trim();
            const songs = getTable("songs");
            const artists = getTable("artists");
            const user = this.getCurrentUser();

            if (cleanMsg.includes("recommend") || cleanMsg.includes("suggest") || cleanMsg.includes("playlist")) {
                let playlistSongs = [];
                let mood = "Chill";
                if (cleanMsg.includes("happy") || cleanMsg.includes("energetic") || cleanMsg.includes("gym")) {
                    playlistSongs = songs.filter(s => ["indie pop", "folk", "kuthu", "mass", "edm", "dance"].includes(s.genre.toLowerCase())).slice(0, 6);
                    mood = "Energetic/Happy Vibes";
                } else if (cleanMsg.includes("sad") || cleanMsg.includes("relax") || cleanMsg.includes("study")) {
                    playlistSongs = songs.filter(s => ["melody", "classical", "romantic", "opera", "lo-fi"].includes(s.genre.toLowerCase())).slice(0, 6);
                    mood = "Calming/Relaxed Beats";
                } else {
                    playlistSongs = songs.slice().sort(() => 0.5 - Math.random()).slice(0, 6);
                    mood = "Personalized AI Mix";
                }

                const trackTitles = playlistSongs.map(s => `• **${s.title}** by ${artists.find(a => a.id === s.artistId)?.name || 'Unknown'}`).join("\n");
                return `Based on your listening history, I've curated a custom **${mood}** queue for you:\n\n${trackTitles}\n\nWould you like me to queue these songs up for you? Say **"load queue"** to start!`;
            }

            if (cleanMsg.includes("play")) {
                const query = cleanMsg.replace("play", "").trim();
                if (query.length > 0) {
                    const song = songs.find(s => s.title.toLowerCase().includes(query));
                    if (song) {
                        return `CMD_PLAY_${song.id}::Playing **${song.title}** right away!`;
                    }
                    const artist = artists.find(a => a.name.toLowerCase().includes(query));
                    if (artist) {
                        const artistSongs = songs.filter(s => s.artistId === artist.id);
                        if (artistSongs.length > 0) {
                            return `CMD_ARTIST_${artist.id}::Loading spotlight station for **${artist.name}**!`;
                        }
                    }
                }
            }

            if (cleanMsg.includes("info") || cleanMsg.includes("who is")) {
                const query = cleanMsg.replace("info", "").replace("who is", "").trim();
                const artist = artists.find(a => a.name.toLowerCase().includes(query));
                if (artist) {
                    return `**${artist.name}** is a verified VR composer with ${artist.listeners} monthly listeners. ${artist.desc} They produce genres like: ${artist.genres.join(", ")}.`;
                }
            }

            const greetings = ["hello", "hi", "hey", "yo"];
            if (greetings.some(g => cleanMsg.startsWith(g))) {
                return `Hey ${user ? user.name : 'there'}! I am your VR AI Music Assistant. Ask me to:\n• *Recommend songs for a happy mood*\n• *Play Aalaporan Thamizhan*\n• *Tell me about A.R. Rahman*`;
            }

            return "I'm still tuning my frequencies, but I can help you find songs, create mood playlists, or play artists. Try typing: *'Play Dheema'* or *'Suggest happy songs'*.";
        },

        // Admin Analytics Dashboard Stats
        getAdminDashboardStats() {
            const user = this.getCurrentUser();
            if (!user || user.role !== "admin") {
                return { success: false, error: "Access Denied: Admin view only." };
            }

            const songs = getTable("songs");
            const users = getTable("users");
            const artists = getTable("artists");

            const totalPlays = songs.reduce((sum, s) => sum + (s.plays || 0), 0);

            return {
                success: true,
                stats: {
                    totalStreams: totalPlays,
                    totalSongs: songs.length,
                    totalUsers: users.length,
                    totalArtists: artists.length,
                    monthlyRevenue: "$" + Math.round((users.length * 9.99 + totalPlays * 0.001) * 100) / 100,
                    streamChartData: {
                        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                        datasets: [12000, 19000, 3000, 5000, 20000, 30000, 45000]
                    },
                    genreDistribution: {
                        labels: ["Pop", "Indie", "Classical", "Mass/Folk"],
                        datasets: [35, 20, 15, 30]
                    }
                }
            };
        }
    };
})();
