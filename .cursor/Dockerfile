# Cursor Cloud Agent image for mattermost-proto-playground.
# Pure Node/npm repo plus a sibling compass-design clone (made by cloud-agent-install.sh):
# no Docker-in-Docker, Go, or databases needed.
# Browser verification uses Cursor's computerUse subagent desktop, so no Chromium libs here.
# xdg-utils: compass-design's `storybook dev` crashes with `spawn xdg-open ENOENT` without it.

FROM ubuntu:24.04
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

ARG DEBIAN_FRONTEND=noninteractive

# Keep in sync with .nvmrc and package.json "engines" (Node ^24, npm ^11), here and in compass-design.
ARG NODE_VERSION=24.11.1

RUN apt-get update && apt-get install -y --no-install-recommends \
    bash ca-certificates curl file git git-lfs gnupg jq less locales lsof \
    make nano netcat-openbsd procps python3 ripgrep rsync sudo tar tmux \
    unzip vim xdg-utils xz-utils zip \
    && locale-gen en_US.UTF-8 \
    && git lfs install --system \
    && rm -rf /var/lib/apt/lists/*

ENV LANG=en_US.UTF-8
ENV LC_ALL=en_US.UTF-8

RUN install -m 0755 -d /etc/apt/keyrings && \
    curl --retry 3 --retry-delay 5 -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | \
      gpg --dearmor -o /etc/apt/keyrings/githubcli-archive-keyring.gpg && \
    chmod a+r /etc/apt/keyrings/githubcli-archive-keyring.gpg && \
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" \
      > /etc/apt/sources.list.d/github-cli.list && \
    apt-get update && \
    apt-get install -y --no-install-recommends gh && \
    rm -rf /var/lib/apt/lists/*

# Official Node tarball into /usr/local so node/npm/npx are on PATH for every shell.
RUN ARCH="$(dpkg --print-architecture)" && \
    case "$ARCH" in \
      amd64) NODE_ARCH=x64 ;; \
      arm64) NODE_ARCH=arm64 ;; \
      *) echo "Unsupported arch: $ARCH" >&2; exit 1 ;; \
    esac && \
    curl --retry 3 --retry-delay 5 -fsSLO "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-${NODE_ARCH}.tar.xz" && \
    curl --retry 3 --retry-delay 5 -fsSL "https://nodejs.org/dist/v${NODE_VERSION}/SHASUMS256.txt" \
      | grep " node-v${NODE_VERSION}-linux-${NODE_ARCH}.tar.xz\$" | sha256sum -c - && \
    tar -xJf "node-v${NODE_VERSION}-linux-${NODE_ARCH}.tar.xz" -C /usr/local --strip-components=1 --no-same-owner && \
    rm "node-v${NODE_VERSION}-linux-${NODE_ARCH}.tar.xz" && \
    node --version && npm --version

# The playground's Vite dev server plus a compass-proto `vite build --watch` in compass-design
# can exceed the default inotify limits; cloud-agent-start.sh re-applies these at boot when allowed.
RUN printf '%s\n' 'fs.inotify.max_user_watches=524288' 'fs.inotify.max_user_instances=512' \
      > /etc/sysctl.d/60-proto-playground-inotify.conf

RUN if ! id -u ubuntu >/dev/null 2>&1; then useradd -m -s /bin/bash ubuntu; fi && \
    usermod -aG sudo ubuntu && \
    echo "ubuntu ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/ubuntu && \
    chmod 0440 /etc/sudoers.d/ubuntu && \
    passwd -l ubuntu && \
    install -d -o ubuntu -g ubuntu /home/ubuntu/.npm-global && \
    echo 'export PATH="$HOME/.npm-global/bin:$PATH"' >> /home/ubuntu/.bashrc && \
    chown ubuntu:ubuntu /home/ubuntu/.bashrc

ENV NPM_CONFIG_PREFIX=/home/ubuntu/.npm-global
ENV NPM_CONFIG_UPDATE_NOTIFIER=false
ENV PATH=/home/ubuntu/.npm-global/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

WORKDIR /home/ubuntu
USER ubuntu
