document.addEventListener("DOMContentLoaded", () => {
    // Configure marked with Highlight.js and Custom Code Blocks Render styling
    if (typeof marked !== "undefined" && typeof hljs !== "undefined") {
        const renderer = new marked.Renderer();
        renderer.code = function(codeOrToken, lang) {
            let codeText = "";
            let language = "";
            
            // Check if Marked.js passed a token object (v5.0+) or legacy parameters
            if (typeof codeOrToken === 'object' && codeOrToken !== null) {
                codeText = codeOrToken.text || "";
                language = codeOrToken.lang || "";
            } else {
                codeText = codeOrToken || "";
                language = lang || "";
            }
            
            language = language.trim() || 'plaintext';
            
            let highlighted;
            try {
                if (hljs.getLanguage(language)) {
                    highlighted = hljs.highlight(codeText, { language }).value;
                } else {
                    highlighted = hljs.highlightAuto(codeText).value;
                }
            } catch (e) {
                highlighted = codeText;
            }
            
            const codeId = 'code-' + Math.random().toString(36).substr(2, 9);
            
            return `
                <div class="code-block-container">
                    <div class="code-block-header">
                        <span class="code-block-lang">${language}</span>
                        <button class="btn-copy-code" data-code-id="${codeId}">Kopyala</button>
                    </div>
                    <pre id="${codeId}"><code class="hljs language-${language}">${highlighted}</code></pre>
                </div>
            `;
        };
        marked.use({ renderer });
        
        marked.setOptions({
            gfm: true,
            breaks: true
        });
    }

    // Workflow Metadata
    const workflowMetadata = {
        writing: {
            title: "İçerik Yazımı (Yazı)",
            nodes: {
                planner: {
                    name: "Planlayıcı Ajan",
                    icon: `
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="agent-svg-icon">
                            <rect x="3" y="3" width="7" height="9" rx="1" />
                            <rect x="14" y="3" width="7" height="5" rx="1" />
                            <rect x="14" y="12" width="7" height="9" rx="1" />
                            <path d="M10 7h4M10 16h4" />
                        </svg>
                    `
                },
                researcher: {
                    name: "Araştırmacı Ajan",
                    icon: `
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="agent-svg-icon">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            <path d="M11 7a4 4 0 0 0-4 4" />
                        </svg>
                    `
                },
                writer: {
                    name: "Yazar Ajan",
                    icon: `
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="agent-svg-icon">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                            <polyline points="10 9 9 9 8 9" />
                        </svg>
                    `
                }
            },
            info: `
                <li><strong>Planlayıcı (Planner):</strong> İstemi analiz edip iş planı sunar.</li>
                <li><strong>Araştırmacı (Researcher):</strong> Plan doğrultusunda konuyu derinlemesine inceler.</li>
                <li><strong>Yazar (Writer):</strong> Bulguları sentezleyerek makale/rapor hazırlar.</li>
            `
        },
        coding: {
            title: "Yazılım Geliştirme (Kod)",
            nodes: {
                planner: {
                    name: "Yazılımcı Ajan",
                    icon: `
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="agent-svg-icon">
                            <polyline points="16 18 22 12 16 6" />
                            <polyline points="8 6 2 12 8 18" />
                            <line x1="14" y1="4" x2="10" y2="20" />
                        </svg>
                    `
                },
                researcher: {
                    name: "Denetçi Ajan",
                    icon: `
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="agent-svg-icon">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                    `
                },
                writer: {
                    name: "Testçi Ajan",
                    icon: `
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="agent-svg-icon">
                            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                        </svg>
                    `
                }
            },
            info: `
                <li><strong>Yazılımcı (Coder):</strong> İstek doğrultusunda algoritma tasarlar ve kod yazar.</li>
                <li><strong>Denetçi (Reviewer):</strong> Kodu performans, hata ve güvenlik açısından inceler.</li>
                <li><strong>Testçi (Tester):</strong> Koda pytest/unittest yazıp nihai yazılım belgesini oluşturur.</li>
            `
        },
        business: {
            title: "İş Stratejisi & SWOT (İş)",
            nodes: {
                planner: {
                    name: "Pazar Analisti",
                    icon: `
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="agent-svg-icon">
                            <line x1="18" y1="20" x2="18" y2="10" />
                            <line x1="12" y1="20" x2="12" y2="4" />
                            <line x1="6" y1="20" x2="6" y2="14" />
                        </svg>
                    `
                },
                researcher: {
                    name: "Stratejist Ajan",
                    icon: `
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="agent-svg-icon">
                            <circle cx="12" cy="12" r="10" />
                            <circle cx="12" cy="12" r="4" />
                            <line x1="12" y1="2" x2="12" y2="4" />
                            <line x1="12" y1="20" x2="12" y2="22" />
                            <line x1="2" y1="12" x2="4" y2="12" />
                            <line x1="20" y1="12" x2="22" y2="12" />
                        </svg>
                    `
                },
                writer: {
                    name: "İş Danışmanı",
                    icon: `
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="agent-svg-icon">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                            <line x1="12" y1="22.08" x2="12" y2="12" />
                        </svg>
                    `
                }
            },
            info: `
                <li><strong>Pazar Analisti (Analyst):</strong> Sektörü tarayarak pazar büyüklüğünü ve trendleri sunar.</li>
                <li><strong>Stratejist (Strategist):</strong> İş fikrinin matris tablosuyla SWOT analizini hazırlar.</li>
                <li><strong>İş Danışmanı (Consultant):</strong> Gelir modelleri ve büyüme yol haritasını kurgular.</li>
            `
        }
    };

    // Elements - Dropdowns
    const modelDropdown = document.getElementById("modelDropdown");
    const modelDropdownTrigger = document.getElementById("modelDropdownTrigger");
    const modelDropdownOptions = document.getElementById("modelDropdownOptions");
    const selectedModelText = document.getElementById("selectedModelText");

    const workflowDropdown = document.getElementById("workflowDropdown");
    const workflowDropdownTrigger = document.getElementById("workflowDropdownTrigger");
    const workflowDropdownOptions = document.getElementById("workflowDropdownOptions");
    const selectedWorkflowText = document.getElementById("selectedWorkflowText");
    
    // Elements - File Upload
    const fileUploadZone = document.getElementById("fileUploadZone");
    const fileInput = document.getElementById("fileInput");
    const uploadStatusText = document.getElementById("uploadStatusText");
    const btnClearFile = document.getElementById("btnClearFile");

    // Elements - Prompt / Buttons
    const agentPrompt = document.getElementById("agentPrompt");
    const btnRun = document.getElementById("btnRun");
    const btnReset = document.getElementById("btnReset");
    const systemStatus = document.getElementById("systemStatus");
    const logsContainer = document.getElementById("logsContainer");
    const workflowInfoList = document.getElementById("workflowInfoList");
    
    // Glowing Action Button
    const reportButtonContainer = document.getElementById("reportButtonContainer");
    const btnShowReport = document.getElementById("btnShowReport");

    // Modal Elements
    const outputModal = document.getElementById("outputModal");
    const modalOutputContainer = document.getElementById("modalOutputContainer");
    const modalWorkflowTitle = document.getElementById("modalWorkflowTitle");
    const btnCloseModal = document.getElementById("btnCloseModal");
    const btnCopyOutput = document.getElementById("btnCopyOutput");
    const btnDownloadMd = document.getElementById("btnDownloadMd");
    const btnDownloadPdf = document.getElementById("btnDownloadPdf");
    
    // Nodes DOM elements references
    const nodes = {
        planner: document.getElementById("node-planner"),
        researcher: document.getElementById("node-researcher"),
        writer: document.getElementById("node-writer")
    };

    const nodeNames = {
        planner: document.getElementById("name-planner"),
        researcher: document.getElementById("name-researcher"),
        writer: document.getElementById("name-writer")
    };

    const nodeIcons = {
        planner: document.getElementById("icon-planner"),
        researcher: document.getElementById("icon-researcher"),
        writer: document.getElementById("icon-writer")
    };

    let ws = null;
    let currentLogCard = null;
    let selectedModelValue = "";      // Stores active Ollama model
    let selectedWorkflowValue = "writing"; // Stores active workflow (writing / coding / business)
    let uploadedFileText = "";        // Stores extracted text content of the uploaded document
    let finalRawMarkdown = "";        // Holds raw markdown output for copying/saving

    // --- CUSTOM DROPDOWNS MANAGEMENT ---

    // Model Dropdown
    modelDropdownTrigger.addEventListener("click", (e) => {
        e.stopPropagation();
        modelDropdown.classList.toggle("open");
        workflowDropdown.classList.remove("open");
    });

    // Workflow Dropdown
    workflowDropdownTrigger.addEventListener("click", (e) => {
        e.stopPropagation();
        workflowDropdown.classList.toggle("open");
        modelDropdown.classList.remove("open");
    });

    // Close all dropdowns when clicking outside
    document.addEventListener("click", () => {
        modelDropdown.classList.remove("open");
        workflowDropdown.classList.remove("open");
    });

    // Handle Workflow Option Clicks
    workflowDropdownOptions.querySelectorAll(".dropdown-option").forEach(option => {
        option.addEventListener("click", (e) => {
            e.stopPropagation();
            
            // Highlight selected
            workflowDropdownOptions.querySelectorAll(".dropdown-option").forEach(opt => opt.classList.remove("selected"));
            option.classList.add("selected");
            
            const value = option.dataset.value;
            selectedWorkflowValue = value;
            selectedWorkflowText.textContent = option.textContent;
            workflowDropdown.classList.remove("open");
            
            // Dynamically change layout configurations (Labels, Icons, Info cards)
            updateWorkflowUI(value);
        });
    });

    function updateWorkflowUI(type) {
        const metadata = workflowMetadata[type];
        if (!metadata) return;
        
        // Update Info card list
        workflowInfoList.innerHTML = metadata.info;
        
        // Update nodes titles and SVGs
        Object.keys(nodes).forEach(key => {
            if (nodeNames[key] && metadata.nodes[key]) {
                nodeNames[key].textContent = metadata.nodes[key].name;
            }
            if (nodeIcons[key] && metadata.nodes[key]) {
                nodeIcons[key].innerHTML = metadata.nodes[key].icon;
            }
        });
        
        // Align connection lines based on new SVG shapes inside icons
        setTimeout(updateConnectionLines, 50);
    }

    // --- OLLAMA API CONNECTION CHECK ---

    async function checkOllamaConnection() {
        try {
            const response = await fetch("/api/models");
            const data = await response.json();
            
            if (data.status === "online") {
                systemStatus.className = "system-status status-online";
                systemStatus.querySelector(".status-text").textContent = "Ollama Çevrimiçi";
                populateDropdown(data.models);
            } else {
                setSystemOffline();
            }
        } catch (err) {
            setSystemOffline();
        }
    }

    function setSystemOffline() {
        systemStatus.className = "system-status status-offline";
        systemStatus.querySelector(".status-text").textContent = "Ollama Çevrimdışı (Ollama'yı Başlatın)";
        
        const fallbacks = ["llama3.1:latest", "deepseek-r1:latest", "llama3.1:8b"];
        populateDropdown(fallbacks);
    }

    function populateDropdown(modelsList) {
        modelDropdownOptions.innerHTML = "";
        
        if (modelsList.length === 0) {
            selectedModelText.textContent = "Model Bulunamadı";
            selectedModelValue = "";
            return;
        }

        modelsList.forEach((model, index) => {
            const optionDiv = document.createElement("div");
            optionDiv.className = "dropdown-option";
            optionDiv.dataset.value = model;
            optionDiv.textContent = model;
            
            if (index === 0) {
                optionDiv.classList.add("selected");
                selectedModelText.textContent = model;
                selectedModelValue = model;
            }
            
            optionDiv.addEventListener("click", (e) => {
                e.stopPropagation();
                document.querySelectorAll("#modelDropdownOptions .dropdown-option").forEach(opt => opt.classList.remove("selected"));
                optionDiv.classList.add("selected");
                selectedModelText.textContent = model;
                selectedModelValue = model;
                modelDropdown.classList.remove("open");
            });
            
            modelDropdownOptions.appendChild(optionDiv);
        });
    }

    checkOllamaConnection();

    // --- FILE UPLOAD LOGIC ---

    fileUploadZone.addEventListener("click", () => {
        fileInput.click();
    });

    fileInput.addEventListener("change", (e) => {
        if (e.target.files.length > 0) {
            handleFileUpload(e.target.files[0]);
        }
    });

    // Drag and drop event listeners
    fileUploadZone.addEventListener("dragover", (e) => {
        e.preventDefault();
        fileUploadZone.classList.add("active");
        uploadStatusText.textContent = "Bırakın...";
    });

    fileUploadZone.addEventListener("dragleave", () => {
        if (!uploadedFileText) {
            fileUploadZone.classList.remove("active");
            uploadStatusText.textContent = "Dosya sürükleyin veya tıklayın";
        } else {
            uploadStatusText.textContent = fileInput.files[0]?.name || "Dosya Yüklendi";
        }
    });

    fileUploadZone.addEventListener("drop", (e) => {
        e.preventDefault();
        if (e.dataTransfer.files.length > 0) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    });

    async function handleFileUpload(file) {
        const formData = new FormData();
        formData.append("file", file);

        uploadStatusText.textContent = "Yükleniyor ve Ayrıştırılıyor...";
        fileUploadZone.style.pointerEvents = "none";
        btnClearFile.style.display = "none";

        try {
            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData
            });

            const data = await response.json();

            if (response.ok && data.status === "success") {
                uploadedFileText = data.text;
                uploadStatusText.textContent = data.filename;
                fileUploadZone.classList.add("active");
                btnClearFile.style.display = "flex";
            } else {
                alert(data.message || "Dosya yüklenemedi.");
                resetFileUploadState();
            }
        } catch (err) {
            console.error("Yükleme hatası:", err);
            alert("Sunucuya bağlanılamadı.");
            resetFileUploadState();
        } finally {
            fileUploadZone.style.pointerEvents = "auto";
        }
    }

    btnClearFile.addEventListener("click", (e) => {
        e.stopPropagation(); // Avoid triggering file selection window
        resetFileUploadState();
    });

    function resetFileUploadState() {
        fileInput.value = "";
        uploadedFileText = "";
        uploadStatusText.textContent = "Dosya sürükleyin veya tıklayın";
        fileUploadZone.classList.remove("active");
        btnClearFile.style.display = "none";
    }

    // --- VIEWPORT VISUAL RESET ---

    function resetVisualStates() {
        Object.values(nodes).forEach(node => {
            node.className = "agent-node";
            node.querySelector(".node-status").textContent = "Beklemede";
        });
        
        document.querySelectorAll(".flow-line").forEach(line => line.classList.remove("active"));
        document.querySelectorAll(".glowing-particle").forEach(p => p.remove());

        reportButtonContainer.classList.remove("show");
        setTimeout(() => {
            reportButtonContainer.style.display = "none";
        }, 400);
        
        // Re-align lines
        setTimeout(updateConnectionLines, 50);
    }

    function getTimestamp() {
        const now = new Date();
        return now.toTimeString().split(' ')[0];
    }

    // --- STREAMING LOG WRITING ---

    function createLogCard(agent, title = "Çalışıyor...") {
        const card = document.createElement("div");
        card.className = `log-entry ${agent}`;
        
        // Resolve dynamic display name based on current workflow
        const agentName = workflowMetadata[selectedWorkflowValue]?.nodes[agent]?.name || agent.toUpperCase();
        
        card.innerHTML = `
            <div class="log-header">
                <span class="log-agent">${agentName.toUpperCase()}</span>
                <span class="log-time">${getTimestamp()}</span>
            </div>
            <div class="log-title" style="font-weight: 600; margin-bottom: 4px; color: var(--text-secondary);">${title}</div>
            <div class="log-content"></div>
        `;
        
        logsContainer.appendChild(card);
        logsContainer.scrollTop = logsContainer.scrollHeight;
        return card;
    }

    function animateDataFlow(fromAgent, toAgent) {
        let lineId = (fromAgent === "planner" && toAgent === "researcher") ? "line-p-r" : "line-r-w";
        const line = document.getElementById(lineId);
        if (line) line.classList.add("active");

        // Determine particle color based on workflow accent colors
        const particleColor = fromAgent === "planner" ? "var(--primary)" : "var(--accent-indigo)";

        // Launch a stream of 4 particles sequentially with slight delay
        for (let i = 0; i < 4; i++) {
            setTimeout(() => {
                createSingleFlowParticle(fromAgent, toAgent, particleColor);
            }, i * 180);
        }

        // Keep connection line highlighted until last particle arrives
        setTimeout(() => {
            if (line) line.classList.remove("active");
        }, 1200 + (3 * 180) + 100);
    }

    function createSingleFlowParticle(fromAgent, toAgent, color) {
        const fromNode = nodes[fromAgent];
        const toNode = nodes[toAgent];
        
        if (!fromNode || !toNode) return;
        
        const container = document.querySelector(".graph-container");
        const containerRect = container.getBoundingClientRect();
        
        const fromRect = fromNode.getBoundingClientRect();
        const toRect = toNode.getBoundingClientRect();
        
        const startX = (fromRect.left + fromRect.width / 2) - containerRect.left;
        const startY = (fromRect.top + fromRect.height / 2) - containerRect.top;
        const endX = (toRect.left + toRect.width / 2) - containerRect.left;
        const endY = (toRect.top + toRect.height / 2) - containerRect.top;
        
        const particle = document.createElement("div");
        particle.className = "glowing-particle";
        
        Object.assign(particle.style, {
            position: 'absolute',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: color,
            boxShadow: `0 0 8px ${color}, 0 0 16px ${color}`,
            left: `${startX - 4}px`,
            top: `${startY - 4}px`,
            zIndex: '10',
            opacity: '0.9',
            transition: 'all 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        });
        
        container.appendChild(particle);
        
        particle.offsetHeight; // Force reflow
        
        particle.style.left = `${endX - 4}px`;
        particle.style.top = `${endY - 4}px`;
        
        setTimeout(() => {
            particle.style.opacity = '0';
            setTimeout(() => {
                particle.remove();
            }, 300);
        }, 1200);
    }

    // Enter key triggers run
    agentPrompt.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            btnRun.click();
        }
    });

    // Run Button click
    btnRun.addEventListener("click", () => {
        const promptText = agentPrompt.value.trim();
        if (!promptText) {
            alert("Lütfen ajanlara verilecek bir görev veya konu girin.");
            return;
        }

        resetVisualStates();
        logsContainer.innerHTML = "";
        btnRun.disabled = true;
        
        // Lock config widgets during run
        modelDropdownTrigger.style.pointerEvents = "none";
        modelDropdownTrigger.style.opacity = "0.5";
        workflowDropdownTrigger.style.pointerEvents = "none";
        workflowDropdownTrigger.style.opacity = "0.5";
        fileUploadZone.style.pointerEvents = "none";
        fileUploadZone.style.opacity = "0.5";
        agentPrompt.disabled = true;
        
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const wsUrl = `${protocol}//${window.location.host}/ws`;
        
        ws = new WebSocket(wsUrl);
        
        ws.onopen = () => {
            ws.send(JSON.stringify({
                prompt: promptText,
                model: selectedModelValue,
                workflow: selectedWorkflowValue,
                file_content: uploadedFileText
            }));
        };
        
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            
            switch (data.event) {
                case "start":
                    const activeNode = nodes[data.agent];
                    if (activeNode) {
                        activeNode.classList.add("active");
                        activeNode.querySelector(".node-status").textContent = "Çalışıyor...";
                    }
                    currentLogCard = createLogCard(data.agent);
                    break;
                    
                case "thought":
                    if (currentLogCard) {
                        currentLogCard.querySelector(".log-title").textContent = data.content;
                    }
                    break;
                    
                case "thought_stream":
                    if (currentLogCard) {
                        const contentDiv = currentLogCard.querySelector(".log-content");
                        contentDiv.textContent += data.chunk;
                        logsContainer.scrollTop = logsContainer.scrollHeight;
                    }
                    break;
                    
                case "complete":
                    const compNode = nodes[data.agent];
                    if (compNode) {
                        compNode.classList.remove("active");
                        compNode.classList.add("complete");
                        compNode.querySelector(".node-status").textContent = "Tamamlandı";
                    }
                    break;
                    
                case "send_data":
                    animateDataFlow(data.from, data.to);
                    
                    const sysCard = document.createElement("div");
                    sysCard.className = "log-entry";
                    sysCard.style.borderLeft = "3px solid var(--primary)";
                    sysCard.style.background = "rgba(255, 255, 255, 0.01)";
                    
                    const fromName = workflowMetadata[selectedWorkflowValue]?.nodes[data.from]?.name || data.from.toUpperCase();
                    const toName = workflowMetadata[selectedWorkflowValue]?.nodes[data.to]?.name || data.to.toUpperCase();
                    
                    sysCard.innerHTML = `
                        <div class="log-header">
                            <span class="log-agent" style="color: var(--primary);">BİLGİ TRANSFERİ</span>
                            <span class="log-time">${getTimestamp()}</span>
                        </div>
                        <div class="log-content" style="font-style: italic; color: var(--text-secondary);">
                            Veri aktarımı tamamlandı: ${fromName} -> ${toName} (${data.data})
                        </div>
                    `;
                    logsContainer.appendChild(sysCard);
                    logsContainer.scrollTop = logsContainer.scrollHeight;
                    break;
                    
                case "final_output":
                    finalRawMarkdown = data.output;
                    modalOutputContainer.innerHTML = marked.parse(data.output);
                    modalWorkflowTitle.textContent = workflowMetadata[selectedWorkflowValue]?.title || "Görev Başarıyla Tamamlandı";
                    
                    reportButtonContainer.style.display = "block";
                    reportButtonContainer.offsetHeight; // force reflow
                    reportButtonContainer.classList.add("show");
                    
                    cleanup();
                    break;
                    
                case "error":
                    alert(data.message);
                    cleanup();
                    break;
            }
        };
        
        ws.onerror = (err) => {
            console.error("WS Hatası:", err);
            alert("Bağlantı hatası oluştu.");
            cleanup();
        };
        
        ws.onclose = () => {
            cleanup();
        };
    });

    btnReset.addEventListener("click", () => {
        if (ws) {
            ws.close();
        }
        cleanup();
        resetVisualStates();
        resetFileUploadState();
        logsContainer.innerHTML = `<div class="empty-state">Henüz bir görev başlatılmadı. Görevi girip "Ajanları Başlat" butonuna veya Enter'a basın.</div>`;
        agentPrompt.value = "";
    });

    // Open Modal Report
    btnShowReport.addEventListener("click", () => {
        outputModal.style.display = "flex";
        outputModal.offsetHeight;
        outputModal.classList.add("show");
    });

    // Close Modal Report
    btnCloseModal.addEventListener("click", () => {
        outputModal.classList.remove("show");
        setTimeout(() => {
            outputModal.style.display = "none";
        }, 400);
    });

    // --- DOCUMENT EXPORT MANAGEMENT ---

    // 1. Copy to clipboard
    btnCopyOutput.addEventListener("click", () => {
        navigator.clipboard.writeText(finalRawMarkdown)
            .then(() => {
                btnCopyOutput.textContent = "Kopyalandı!";
                setTimeout(() => {
                    btnCopyOutput.textContent = "Kopyala";
                }, 1800);
            })
            .catch(err => {
                console.error("Kopyalama hatası:", err);
                alert("Panoya kopyalanamadı.");
            });
    });

    // 2. Download raw Markdown file
    btnDownloadMd.addEventListener("click", () => {
        try {
            const blob = new Blob([finalRawMarkdown], { type: "text/markdown;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `nihai-rapor-${selectedWorkflowValue}.md`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Markdown indirme hatası:", err);
            alert("Dosya indirilemedi.");
        }
    });

    // 3. Download high-quality PDF using html2pdf
    btnDownloadPdf.addEventListener("click", () => {
        try {
            // Apply temporary styles for cleaner print layout inside pdf
            const opt = {
                margin:       12,
                filename:     `nihai-rapor-${selectedWorkflowValue}.pdf`,
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { 
                    scale: 2, 
                    useCORS: true,
                    backgroundColor: '#ffffff' // High-contrast white background for clean printable document
                },
                jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            // Clone container to parse with custom print style colors (black text)
            const element = modalOutputContainer.cloneNode(true);
            element.style.color = "#000000";
            // Force subheaders and text to have print-friendly colors
            element.querySelectorAll("h1, h2, h3, h4, th").forEach(el => el.style.color = "#000000");
            element.querySelectorAll("p, li, td").forEach(el => el.style.color = "#222222");
            element.querySelectorAll("pre").forEach(el => {
                el.style.background = "#f5f5f5";
                el.style.color = "#000000";
                el.style.border = "1px solid #dddddd";
            });
            element.querySelectorAll("code").forEach(el => {
                el.style.background = "#f0f0f0";
                el.style.color = "#a10000";
            });

            html2pdf().set(opt).from(element).save();
        } catch (err) {
            console.error("PDF indirme hatası:", err);
            alert("PDF belgesi oluşturulamadı.");
        }
    });

    // Global event listener for copy code button in markdown code blocks
    document.addEventListener("click", (e) => {
        if (e.target && e.target.classList.contains("btn-copy-code")) {
            const codeId = e.target.dataset.codeId;
            const preElement = document.getElementById(codeId);
            if (preElement) {
                const codeText = preElement.innerText || preElement.textContent;
                navigator.clipboard.writeText(codeText)
                    .then(() => {
                        e.target.textContent = "Kopyalandı!";
                        e.target.style.borderColor = "var(--accent-green)";
                        e.target.style.color = "var(--accent-green)";
                        setTimeout(() => {
                            e.target.textContent = "Kopyala";
                            e.target.style.borderColor = "";
                            e.target.style.color = "";
                        }, 1800);
                    })
                    .catch(err => {
                        console.error("Kod kopyalama hatası:", err);
                    });
            }
        }
    });

    // --- DYNAMIC SVG CONNECTOR LINE ALIGNMENT ---
    function updateConnectionLines() {
        const container = document.querySelector(".graph-container");
        if (!container) return;
        const containerRect = container.getBoundingClientRect();
        
        const linePR = document.getElementById("line-p-r");
        const lineRW = document.getElementById("line-r-w");
        
        const iconP = document.getElementById("icon-planner");
        const iconR = document.getElementById("icon-researcher");
        const iconW = document.getElementById("icon-writer");
        
        if (!iconP || !iconR || !iconW) return;
        
        const rectP = iconP.getBoundingClientRect();
        const rectR = iconR.getBoundingClientRect();
        const rectW = iconW.getBoundingClientRect();
        
        // Calculate coordinate centers of the circular agent icons relative to parent container
        const xP = (rectP.left + rectP.width / 2) - containerRect.left;
        const yP_bottom = rectP.bottom - containerRect.top;
        
        const xR = (rectR.left + rectR.width / 2) - containerRect.left;
        const yR_top = rectR.top - containerRect.top;
        const yR_bottom = rectR.bottom - containerRect.top;
        
        const xW = (rectW.left + rectW.width / 2) - containerRect.left;
        const yW_top = rectW.top - containerRect.top;
        
        // Update SVG line attributes (leaving a 4px gap for high-tech aesthetic)
        if (linePR) {
            linePR.setAttribute("x1", xP);
            linePR.setAttribute("y1", yP_bottom + 4);
            linePR.setAttribute("x2", xR);
            linePR.setAttribute("y2", yR_top - 4);
        }
        
        if (lineRW) {
            lineRW.setAttribute("x1", xR);
            lineRW.setAttribute("y1", yR_bottom + 4);
            lineRW.setAttribute("x2", xW);
            lineRW.setAttribute("y2", yW_top - 4);
        }
    }

    // Call layout update on resize
    window.addEventListener("resize", updateConnectionLines);
    
    // Initial call to align lines correctly
    setTimeout(updateConnectionLines, 200);

    function cleanup() {
        btnRun.disabled = false;
        
        // Unlock config widgets
        modelDropdownTrigger.style.pointerEvents = "auto";
        modelDropdownTrigger.style.opacity = "1";
        workflowDropdownTrigger.style.pointerEvents = "auto";
        workflowDropdownTrigger.style.opacity = "1";
        fileUploadZone.style.pointerEvents = "auto";
        fileUploadZone.style.opacity = "1";
        
        agentPrompt.disabled = false;
        if (ws) ws = null;
    }
});
