"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileValidation = void 0;
exports.fileValidation = {
    images: [
        "image/jpeg",
        "image/pjpeg",
        "image/png",
        "image/svg+xml",
        "image/webp",
    ],
    videos: ["video/mp4", "video/webm", "video/x-matroska"],
    audios: [
        "audio/aiff",
        "audio/mp4",
        "audio/mp4a-latm",
        "audio/mpeg",
        "audio/webm",
    ],
    documents: [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
};
