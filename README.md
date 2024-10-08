# f0-cli

## Setup Instructions

### 1. Add Bun to PATH

To use the F0 CLI, you need to add Bun to your PATH. Add the following line to your shell configuration file (e.g., `~/.bashrc`, `~/.zshrc`, or `~/.bash_profile`):

```bash
export PATH=$PATH:~/.bun/bin
```

After adding this line, restart your terminal or run `source ~/.bashrc` (or the appropriate file for your shell) to apply the changes.

### 2. Set up OpenAI API Key

The F0 CLI requires an OpenAI API key to function. Follow these steps to set it up:

1. Create a config file:
   ```bash
   mkdir -p ~/.config/full0
   touch ~/.config/full0/config.json
   ```

2. Add your OpenAI API key to the config file:
   ```bash
   echo '{"openaiApiKey": "your-api-key-here"}' > ~/.config/full0/config.json
   ```

   Replace `your-api-key-here` with your actual OpenAI API key.

## Usage

[Add usage instructions for your CLI here]


This project was created using `bun init` in bun v1.1.4. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

# full0
