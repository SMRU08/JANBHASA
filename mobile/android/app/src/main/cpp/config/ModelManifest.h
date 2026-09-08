// ============================================================
// ModelManifest.h
// JSON-based manifest with SHA-256 integrity validation.
// ============================================================
#pragma once

#include <string>
#include <vector>
#include <unordered_map>
#include <optional>
#include <cstdint>

namespace janbhasha {

struct ModelEntry {
    std::string id;            // e.g., "whisper_small_indic"
    std::string displayName;
    std::string modelType;     // "asr" | "nmt" | "tts"
    std::string localPath;     // absolute path on device
    std::string sha256;        // hex digest of model binary
    uint64_t    fileSizeBytes;
    uint32_t    estimatedRamMb;
    std::string quantization;  // "int8" | "fp32"
    bool        required;
};

/**
 * ModelManifest — loads and validates model_manifest.json from internal storage.
 *
 * manifest JSON schema:
 * {
 *   "version": "1.0",
 *   "models": [
 *     {
 *       "id": "whisper_small_indic",
 *       "displayName": "Whisper Small Indic (INT8)",
 *       "modelType": "asr",
 *       "localPath": "/data/user/0/com.janbhasha/files/models/asr/",
 *       "sha256": "deadbeef...",
 *       "fileSizeBytes": 245366784,
 *       "estimatedRamMb": 280,
 *       "quantization": "int8",
 *       "required": true
 *     }
 *   ]
 * }
 */
class ModelManifest {
public:
    explicit ModelManifest(const std::string& manifestPath);

    // Loads and parses the manifest JSON file.
    // Throws JanbhashaError(MODEL_MANIFEST_INVALID) on parse error.
    bool load();

    // Returns model entry by ID, or nullopt if not found.
    std::optional<ModelEntry> find(const std::string& modelId) const;

    // Returns true if the model binary's SHA-256 matches the manifest entry.
    // Throws JanbhashaError(MODEL_NOT_FOUND) if file doesn't exist.
    bool verifyChecksum(const std::string& modelId) const;

    const std::vector<ModelEntry>& entries() const { return entries_; }

    bool isLoaded() const { return loaded_; }

private:
    std::string manifestPath_;
    std::vector<ModelEntry> entries_;
    bool loaded_ = false;

    // SHA-256 of a file at the given path.
    static std::string computeSha256(const std::string& filePath);
};

} // namespace janbhasha
