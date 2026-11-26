# Game tools that run on your own PC

Three of the five tools from the "Claude Code game studio" video need a game engine or a GPU on your own computer, so they can't live in this repo or run in a cloud session. Install them on your PC with the steps below (taken from each project's README).

Already set up in this repo:

- **Claude-Code-Game-Studios**: the agents, skills, hooks and rules in `.claude/`, plus `CLAUDE.md` and `project.yaml`. Start with `/start`.
- **godot-mcp**: configured in `.mcp.json`. Install [Godot 4](https://godotengine.org/download) on your PC, then approve the `godot` server the first time Claude Code asks. If Godot isn't detected, set `GODOT_PATH` in `.mcp.json` to the Godot executable.

> **Version clash.** UnrealClaude needs **Unreal Engine 5.7**, and the Audio2Face-3D Unreal plugin supports up to **UE 5.6**. You can't use both in the same Unreal project until NVIDIA ships a 5.7 build.

## UnrealClaude (Unreal Editor integration)

Repo: https://github.com/Natfii/UnrealClaude. Needs Unreal Engine 5.7 (Windows, Linux or Apple Silicon Mac), Node.js and Claude Code.

1. Clone it with its submodule:
   ```bash
   git clone --recurse-submodules https://github.com/Natfii/UnrealClaude.git
   ```
2. Build it for your engine. On Windows, from your Unreal Engine folder:
   ```bash
   Engine\Build\BatchFiles\RunUAT.bat BuildPlugin -Plugin="PATH\TO\UnrealClaude\UnrealClaude\UnrealClaude.uplugin" -Package="OUTPUT\PATH" -TargetPlatforms=Win64
   ```
3. Copy the build output into your Unreal project's `Plugins/` folder.
4. Install the MCP bridge's dependencies:
   ```bash
   cd <PluginPath>/UnrealClaude/Resources/mcp-bridge
   npm install
   ```
5. Turn the plugin on in the editor's plugin browser (Editor category).

## ACE-Step 1.5 (music generation)

Repo: https://github.com/ace-step/ACE-Step-1.5. Needs Python 3.11 or 3.12 and works best on a CUDA GPU. With no GPU, use the free hosted version at https://acemusic.ai.

```bash
# Windows (PowerShell): install uv
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
# macOS / Linux: curl -LsSf https://astral.sh/uv/install.sh | sh

git clone https://github.com/ACE-Step/ACE-Step-1.5.git
cd ACE-Step-1.5
uv sync
uv run acestep   # opens the web UI; models download on first run
```

## NVIDIA Audio2Face-3D (lip-sync and facial animation)

Hub: https://github.com/NVIDIA/Audio2Face-3D. Needs an NVIDIA GPU.

For Unreal Engine 5, download the plugin that matches your engine, plus the models plugin:

- [ACE plugin for UE 5.6](https://developer.nvidia.com/downloads/assets/ace/nv_ace_reference-ue5.6-v2.5.0rc3.zip)
- [ACE plugin for UE 5.5](https://developer.nvidia.com/downloads/assets/ace/nv_ace_reference-ue5.5-v2.5.0rc3.zip)
- [Audio2Face-3D 3.0 models plugin](https://developer.nvidia.com/downloads/assets/ace/ace_3.0_a2f_models.zip)

Unzip both into your Unreal project's `Plugins/` folder and turn them on in the editor. For use outside Unreal, the C++/Python SDK is at https://github.com/NVIDIA/Audio2Face-3D-SDK.
