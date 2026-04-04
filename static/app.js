/* ============================================
   SmartDocShield — Futuristic UI Engine
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initNavScroll();
    initScrollAnimations();
    initUploadZone();
    initLoginModal();
    initOTPInputs();
    initStatCounters();
    initConnectionLines();
    initSmoothScroll();
    initSessionManagement();
});

function initSessionManagement() {
    try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            console.log(`[SmartDocShield] 🔒 Session detected for ${user.username}`);

            // Toggle Nav Bar
            const navAuth = document.getElementById('navAuthMode');
            const navSession = document.getElementById('navSessionMode');
            if (navAuth) navAuth.style.display = 'none';
            if (navSession) navSession.style.display = 'flex';

            // Toggle Hero Content
            const heroTitleMain = document.getElementById('heroTitleMain');
            const heroTitleSession = document.getElementById('heroTitleSession');
            const heroSessionName = document.getElementById('heroSessionName');
            if (heroTitleMain) heroTitleMain.style.display = 'none';
            if (heroTitleSession) heroTitleSession.style.display = 'block';
            if (heroSessionName) heroSessionName.textContent = user.name ? user.name.split(' ')[0] : user.username;

            const heroTaglineMain = document.getElementById('heroTaglineMain');
            const heroTaglineSession = document.getElementById('heroTaglineSession');
            if (heroTaglineMain) heroTaglineMain.style.display = 'none';
            if (heroTaglineSession) heroTaglineSession.style.display = 'block';

            const heroAuthActions = document.getElementById('heroAuthActions');
            const heroSessionActions = document.getElementById('heroSessionActions');
            if (heroAuthActions) heroAuthActions.style.display = 'none';
            if (heroSessionActions) heroSessionActions.style.display = 'flex';

            // Show upload section only for logged-in users
            const uploadSection = document.getElementById('upload');
            if (uploadSection) uploadSection.style.display = 'block';

            // Bind Log Out
            const navLogoutBtn = document.getElementById('navLogoutBtn');
            if (navLogoutBtn) {
                navLogoutBtn.addEventListener('click', () => {
                    localStorage.removeItem('user');
                    window.location.reload();
                });
            }

            // Sync History
            fetchDocumentHistory(user.username);
        }
    } catch (err) {
        console.error('[SmartDocShield] ❌ Session parsing error', err);
    }
}

function fetchDocumentHistory(username, query = "") {
    if (!username) return;
    const url = `/api/documents?username=${encodeURIComponent(username)}&q=${encodeURIComponent(query)}`;
    fetch(url)
    .then(r => r.json())
    .then(data => {
        const historyPanel = document.getElementById('historyPanel');
        const container = document.getElementById('historyContainer');
        
        if (data.success) {
            if (data.documents.length > 0) {
                historyPanel.style.display = 'block';
                renderHistory(data.documents);
            } else if (query) {
                // If there's a search term but no results, show empty state instead of hiding
                historyPanel.style.display = 'block';
                container.innerHTML = '<p style="color:var(--text-dim); text-align:center; padding:20px;">No matching documents found.</p>';
            } else {
                historyPanel.style.display = 'none';
            }
        }
    }).catch(err => console.error('Failed to sync document history: ', err));
}

// Attach Search Event Listener
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('archiveSearchInput');
    let searchTimeout;
    
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                const rawUser = localStorage.getItem('user');
                if (rawUser) {
                    const user = JSON.parse(rawUser);
                    fetchDocumentHistory(user.username, e.target.value);
                }
            }, 400); // 400ms debounce
        });
    }
});

function renderHistory(docs) {
    const container = document.getElementById('historyContainer');
    if (!container) return;
    container.innerHTML = '';
    
    docs.forEach(doc => {
        const card = document.createElement('div');
        const riskClass = doc.risk_level === 'Critical' ? 'risk-critical' : doc.risk_level === 'High' ? 'risk-high' : doc.risk_level === 'Medium' ? 'risk-medium' : 'risk-low';
        card.style.background = 'rgba(0,0,0,0.2)';
        card.style.padding = '20px';
        card.style.borderRadius = '12px';
        card.style.border = '1px solid rgba(255,255,255,0.05)';
        card.style.display = 'grid';
        card.style.gridTemplateColumns = '1fr 2fr';
        card.style.gap = '20px';
        card.style.alignItems = 'start';

        card.innerHTML = `
            <div>
                <h4 style="color:var(--neon-blue); margin-bottom: 8px;">📄 ${doc.custom_name ? doc.custom_name + ' <br><small style="color:var(--text-dim);">(' + doc.filename + ')</small>' : doc.filename}</h4>
                <div class="risk-badge ${riskClass}" style="margin-bottom: 10px; display:inline-block;">Risk: ${doc.risk_level}</div>
                <p style="font-size:0.8rem; color:var(--text-dim);">Processed: ${new Date(doc.upload_date).toLocaleDateString()}</p>
            </div>
            <div style="background: rgba(12,12,30,0.6); padding: 15px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
                <span style="display:block; font-size:0.75rem; letter-spacing:1px; text-transform:uppercase; color:var(--text-dim); margin-bottom:8px;">AI Extractive Summary</span>
                <p style="font-size:0.85rem; line-height:1.5;">${doc.summary || 'No summary generated.'}</p>
            </div>
        `;
        container.appendChild(card);
    });
}

/* ============================================
   1. Particle System — Full Background
   ============================================ */

function initParticles() {
    const canvas = document.getElementById('particleCanvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: null, y: null, radius: 150 };
    let animId;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    resize();
    window.addEventListener('resize', resize);

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.x;
        mouse.y = e.y;
    });

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.baseSize = this.size;
            this.speedX = (Math.random() - 0.5) * 0.4;
            this.speedY = (Math.random() - 0.5) * 0.4;
            this.opacity = Math.random() * 0.5 + 0.1;
            this.baseOpacity = this.opacity;
            // Color palette: cyan, purple, blue
            const colors = [
                { r: 0, g: 212, b: 255 },    // cyan
                { r: 180, g: 76, b: 255 },    // purple
                { r: 99, g: 102, b: 241 },    // indigo
                { r: 0, g: 255, b: 136 },     // green (sparse)
                { r: 124, g: 58, b: 237 },    // violet
            ];
            const weights = [35, 25, 20, 5, 15];
            const rand = Math.random() * 100;
            let cumulative = 0;
            for (let i = 0; i < weights.length; i++) {
                cumulative += weights[i];
                if (rand <= cumulative) {
                    this.color = colors[i];
                    break;
                }
            }
            // Holographic shimmer
            this.shimmerSpeed = Math.random() * 0.02 + 0.005;
            this.shimmerPhase = Math.random() * Math.PI * 2;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            // Mouse interaction
            if (mouse.x !== null) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < mouse.radius) {
                    const force = (mouse.radius - dist) / mouse.radius;
                    this.x -= dx * force * 0.02;
                    this.y -= dy * force * 0.02;
                    this.size = this.baseSize + force * 2;
                    this.opacity = Math.min(this.baseOpacity + force * 0.3, 0.9);
                } else {
                    this.size += (this.baseSize - this.size) * 0.05;
                    this.opacity += (this.baseOpacity - this.opacity) * 0.05;
                }
            }

            // Shimmer
            this.shimmerPhase += this.shimmerSpeed;
            const shimmer = Math.sin(this.shimmerPhase) * 0.3 + 0.7;

            // Wrap around
            if (this.x < -10) this.x = canvas.width + 10;
            if (this.x > canvas.width + 10) this.x = -10;
            if (this.y < -10) this.y = canvas.height + 10;
            if (this.y > canvas.height + 10) this.y = -10;

            return shimmer;
        }

        draw(shimmer) {
            const alpha = this.opacity * shimmer;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${alpha})`;
            ctx.fill();

            // Glow
            if (this.size > 1.5) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${alpha * 0.08})`;
                ctx.fill();
            }
        }
    }

    // Calculate particle count based on screen
    const count = Math.min(Math.floor((canvas.width * canvas.height) / 8000), 200);
    for (let i = 0; i < count; i++) {
        particles.push(new Particle());
    }

    function drawConnections() {
        const maxDist = 120;
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < maxDist) {
                    const opacity = (1 - dist / maxDist) * 0.12;
                    const r = Math.round((particles[i].color.r + particles[j].color.r) / 2);
                    const g = Math.round((particles[i].color.g + particles[j].color.g) / 2);
                    const b = Math.round((particles[i].color.b + particles[j].color.b) / 2);
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (const p of particles) {
            const shimmer = p.update();
            p.draw(shimmer);
        }

        drawConnections();
        animId = requestAnimationFrame(animate);
    }

    animate();
}

/* ============================================
   2. Navigation Scroll Effect
   ============================================ */

function initNavScroll() {
    const nav = document.getElementById('navbar');
    const links = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }

        // Active section highlight
        const sections = ['hero', 'features', 'pipeline', 'upload'];
        let current = '';
        for (const id of sections) {
            const el = document.getElementById(id);
            if (el) {
                const rect = el.getBoundingClientRect();
                if (rect.top <= 200) current = id;
            }
        }
        links.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === '#' + current);
        });
    });
}

/* ============================================
   3. Scroll-based Reveal Animations
   ============================================ */

function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                const delay = entry.target.dataset.delay || '0s';
                const delayMs = parseFloat(delay) * 1000;
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, delayMs + index * 100);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    // Feature cards
    document.querySelectorAll('.feature-card').forEach((card, i) => {
        card.dataset.delay = (i * 0.1).toString();
        observer.observe(card);
    });

    // Pipeline steps
    document.querySelectorAll('.pipeline-step').forEach((step, i) => {
        step.dataset.delay = (i * 0.15).toString();
        observer.observe(step);
    });
}

/* ============================================
   4. Upload Zone — Drag & Drop
   ============================================ */

function initUploadZone() {
    const zone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('fileInput');
    const processingPanel = document.getElementById('processingPanel');

    if (!zone || !fileInput) return; // elements may be hidden

    function requireAuth() {
        if (!localStorage.getItem('user')) {
            const modal = document.getElementById('loginModal');
            if (modal) {
                modal.style.display = 'flex';
                showModalError('Please login or sign up to process documents.', 'error');
            } else {
                alert('Please Login or Sign Up first.');
            }
            return false;
        }
        return true;
    }

    zone.addEventListener('click', () => {
        if (requireAuth()) fileInput.click();
    });

    zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        zone.classList.add('drag-over');
    });

    zone.addEventListener('dragleave', () => {
        zone.classList.remove('drag-over');
    });

    zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.classList.remove('drag-over');
        if (!requireAuth()) return;
        
        if (e.dataTransfer.files.length > 0) {
            fileInput.files = e.dataTransfer.files;
            simulateProcessing(e.dataTransfer.files);
        }
    });

    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            simulateProcessing(fileInput.files);
        }
    });

    function simulateProcessing(processedFile = null) {
        let fileList = [];
        if (processedFile) {
            if (processedFile instanceof FileList || Array.isArray(processedFile)) {
                fileList = processedFile;
            } else {
                fileList = [processedFile];
            }
        } else {
            fileList = fileInput.files;
        }
        
        if (!fileList || fileList.length === 0) return;
        
        processingPanel.classList.add('active');
        document.getElementById('resultsPanel').style.display = 'none';
        
        const bar = processingPanel.querySelector('.proc-bar');
        const steps = processingPanel.querySelectorAll('.proc-step');

        steps.forEach(s => { s.classList.remove('done', 'active'); });
        bar.style.width = '0%';
        
        let currentStep = 0;
        const stepPercentages = [20, 50, 75, 90, 100];
        function setProgress(stepIdx) {
            steps.forEach((s, i) => {
                s.classList.remove('active', 'done');
                if (i < stepIdx) {
                    s.classList.add('done');
                    const c = s.querySelector('.proc-dot');
                    if(c) c.outerHTML = '<div class="proc-check">✓</div>';
                } else if (i === stepIdx) {
                    s.classList.add('active');
                }
            });
            bar.style.width = stepPercentages[stepIdx] + '%';
        }
        
        setProgress(0);
        let mockProgress = setInterval(() => {
            if (currentStep < 3) {
                currentStep++;
                setProgress(currentStep);
            }
        }, 1200);

        const formData = new FormData();
        for (let i = 0; i < fileList.length; i++) {
            formData.append('files', fileList[i]);
        }
        
        const rawUser = localStorage.getItem('user');
        if (rawUser) {
            try {
                formData.append('username', JSON.parse(rawUser).username);
            } catch(e) {}
        }
        const customNameField = document.getElementById('customFileName');
        if (customNameField && customNameField.value) {
            formData.append('custom_name', customNameField.value);
        }

        fetch('/api/upload', {
            method: 'POST',
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            clearInterval(mockProgress);
            setProgress(4);
            setTimeout(() => {
                processingPanel.classList.remove('active');
                if (data.success) {
                    displayProcessingResults(data);
                } else {
                    alert('Upload failed: ' + data.error);
                }
            }, 800);
        })
        .catch(err => {
            clearInterval(mockProgress);
            alert('Server error: ' + err.message);
            processingPanel.classList.remove('active');
        });
    }

    function displayProcessingResults(data) {
        const resultsPanel = document.getElementById('resultsPanel');
        resultsPanel.style.display = 'block';

        resultsPanel.innerHTML = `
            <div class="results-header">
                <h3>🔍 Document Intelligence Report</h3>
                <button id="downloadBtn" class="btn-primary" style="padding: 10px 20px; font-size: 0.85rem;">
                    <span class="btn-glow"></span>
                    <span>Download PDF</span>
                </button>
            </div>
            <div id="resultsBlocksContainer" style="display:flex; flex-direction:column; gap:30px;"></div>
        `;

        const container = document.getElementById('resultsBlocksContainer');

        // Entity label color map for visual distinction
        const labelColors = {
            'Person / Name': { bg: 'rgba(0, 212, 255, 0.12)', color: '#00d4ff', border: 'rgba(0, 212, 255, 0.25)' },
            'Organization': { bg: 'rgba(180, 76, 255, 0.12)', color: '#b44cff', border: 'rgba(180, 76, 255, 0.25)' },
            'Location (City/Country)': { bg: 'rgba(0, 255, 136, 0.12)', color: '#00ff88', border: 'rgba(0, 255, 136, 0.25)' },
            'Location (Geographic)': { bg: 'rgba(0, 255, 136, 0.12)', color: '#00ff88', border: 'rgba(0, 255, 136, 0.25)' },
            'Date': { bg: 'rgba(255, 183, 77, 0.12)', color: '#ffb74d', border: 'rgba(255, 183, 77, 0.25)' },
            'Monetary Amount': { bg: 'rgba(255, 51, 119, 0.12)', color: '#ff3377', border: 'rgba(255, 51, 119, 0.25)' },
            'Key Phrase': { bg: 'rgba(99, 102, 241, 0.12)', color: '#818cf8', border: 'rgba(99, 102, 241, 0.25)' },
            'Group / Nationality': { bg: 'rgba(244, 143, 177, 0.12)', color: '#f48fb1', border: 'rgba(244, 143, 177, 0.25)' },
        };
        const defaultLabelColor = { bg: 'rgba(200, 200, 255, 0.08)', color: '#c8c8ff', border: 'rgba(200, 200, 255, 0.2)' };

        data.results.forEach(res => {
            const card = document.createElement('div');
            card.style.cssText = 'background:rgba(0,0,0,0.2); padding:28px; border-radius:16px; border:1px solid rgba(255,255,255,0.05);';

            if (!res.success) {
                card.innerHTML = `<h4 style="color:#ff3377;">📄 ${res.filename} — Error</h4><p style="color:#e0e0e0; margin-top:10px;">${res.error}</p>`;
                container.appendChild(card);
                return;
            }

            // ── Risk badge styling ──
            const riskStyles = {
                'Critical': { cls: 'risk-critical', bg: 'rgba(255,0,0,0.15)', color: '#ff4444', border: 'rgba(255,0,0,0.3)' },
                'High': { cls: 'risk-high', bg: 'rgba(255,51,119,0.12)', color: '#ff3377', border: 'rgba(255,51,119,0.25)' },
                'Medium': { cls: 'risk-medium', bg: 'rgba(255,183,77,0.12)', color: '#ffb74d', border: 'rgba(255,183,77,0.25)' },
                'Low': { cls: 'risk-low', bg: 'rgba(0,255,136,0.12)', color: '#00ff88', border: 'rgba(0,255,136,0.25)' },
            };
            const riskStyle = riskStyles[res.risk_level] || riskStyles['Low'];

            // ── Doc type badge ──
            const docType = res.doc_type || 'Document';

            // ── Build Entities by Category (grouped) ──
            let entitiesGroupedHTML = '';
            const grouped = res.entities_grouped || {};
            const groupKeys = Object.keys(grouped);

            if (groupKeys.length > 0) {
                groupKeys.forEach(category => {
                    const items = grouped[category];
                    const colors = labelColors[category] || defaultLabelColor;
                    entitiesGroupedHTML += `
                        <div style="margin-bottom:16px;">
                            <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
                                <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${colors.color};"></span>
                                <span style="font-size:0.8rem; font-weight:600; text-transform:uppercase; letter-spacing:0.8px; color:${colors.color};">${category}</span>
                                <span style="font-size:0.7rem; color:var(--text-dim); margin-left:4px;">(${items.length})</span>
                            </div>
                            <div style="display:flex; flex-wrap:wrap; gap:8px; padding-left:16px;">
                                ${items.map(item => `
                                    <span style="
                                        display:inline-block;
                                        padding:6px 14px;
                                        border-radius:8px;
                                        font-size:0.85rem;
                                        background:${colors.bg};
                                        color:${colors.color};
                                        border:1px solid ${colors.border};
                                        transition: all 0.2s ease;
                                    ">${item}</span>
                                `).join('')}
                            </div>
                        </div>
                    `;
                });
            } else {
                entitiesGroupedHTML = '<p style="color:var(--text-dim); font-size:0.9rem; padding:12px 0;">No named entities detected in this document.</p>';
            }

            // ── Build PII rows ──
            let piiHTML = '';
            if (res.pii && res.pii.length > 0) {
                res.pii.forEach(p => {
                    let masked = p.value;
                    if (p.type === 'SSN') masked = 'XXX-XX-' + p.value.slice(-4);
                    else if (p.type === 'Phone') masked = '(XXX) XXX-' + p.value.slice(-4);
                    else if (p.type === 'Email') masked = p.value.replace(/(.{2}).*(@.*)/, '$1***$2');
                    else if (p.type === 'PAN Card') masked = 'XXXXX' + p.value.slice(5, 9) + 'X';
                    else if (p.type === 'Aadhaar') masked = 'XXXX XXXX ' + p.value.slice(-4);
                    else if (p.type === 'Credit Card') masked = 'XXXX-XXXX-XXXX-' + p.value.slice(-4);
                    else if (p.type === 'Date of Birth') masked = '[DOB REDACTED]';
                    piiHTML += `
                        <tr>
                            <td style="padding:12px 14px; border-bottom:1px solid rgba(255,255,255,0.04);">
                                <span style="display:inline-flex; align-items:center; gap:6px;">
                                    <span style="color:#ff3377;">⚠</span> ${p.type}
                                </span>
                            </td>
                            <td style="padding:12px 14px; border-bottom:1px solid rgba(255,255,255,0.04); font-family:'Courier New', monospace; color:#ff6b8a; font-size:0.9rem;">${masked}</td>
                            <td style="padding:12px 14px; border-bottom:1px solid rgba(255,255,255,0.04);">
                                <span style="display:inline-block; padding:4px 10px; border-radius:6px; font-size:0.75rem; font-weight:600; background:rgba(0,255,136,0.1); color:#00ff88; border:1px solid rgba(0,255,136,0.2);">✓ Masked</span>
                            </td>
                        </tr>`;
                });
            }

            // ── Escape extracted text for safe HTML display ──
            const escapeHTML = (str) => str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
            const extractedTextSafe = escapeHTML(res.extracted_text || res.raw_text || '');
            const textLines = extractedTextSafe.split('\n').filter(l => l.trim());

            // ── Risk description ──
            const riskDescriptions = {
                'Critical': '🚨 Multiple highly sensitive PII items detected. Immediate review and remediation required before any sharing or processing.',
                'High': '⚠️ Several sensitive data items found. This document contains significant PII that should be reviewed before sharing.',
                'Medium': '⚡ Some sensitive data is present. Review the flagged items before distributing this document.',
                'Low': '✅ No significant privacy risks detected. This document appears safe to process and share.',
            };

            // ═══════════════════════════════════════
            // ASSEMBLE THE FULL REPORT CARD
            // ═══════════════════════════════════════
            card.innerHTML = `
                <!-- Header: Filename + Document Type + Meta -->
                <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:24px; flex-wrap:wrap; gap:12px;">
                    <div style="display:flex; align-items:center; gap:12px;">
                        <span style="font-size:1.6rem;">📄</span>
                        <div>
                            <h3 style="color:var(--neon-blue); font-size:1.25rem; margin:0;">${res.filename}</h3>
                            <span style="font-size:0.8rem; color:var(--text-dim);">${res.text_length.toLocaleString()} characters extracted</span>
                        </div>
                    </div>
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span style="
                            display:inline-block; padding:6px 14px; border-radius:8px;
                            font-size:0.8rem; font-weight:600;
                            background:rgba(99,102,241,0.12); color:#818cf8;
                            border:1px solid rgba(99,102,241,0.25);
                        ">📋 ${docType}</span>
                        <span style="
                            display:inline-block; padding:6px 14px; border-radius:8px;
                            font-size:0.8rem; font-weight:600;
                            background:${riskStyle.bg}; color:${riskStyle.color};
                            border:1px solid ${riskStyle.border};
                        ">Risk: ${res.risk_level}</span>
                    </div>
                </div>

                <!-- SECTION 1: AI Summary -->
                <div style="background:rgba(12,12,30,0.6); padding:22px; border-radius:14px; border:1px solid rgba(255,255,255,0.05); margin-bottom:20px;">
                    <h4 style="color:var(--neon-blue); margin-bottom:12px; font-size:0.82rem; letter-spacing:1.2px; text-transform:uppercase; display:flex; align-items:center; gap:8px;">
                        <span style="font-size:1rem;">📝</span> Document Summary
                    </h4>
                    <p style="font-size:0.95rem; line-height:1.8; color:#e0e0e0;">${res.summary || "Could not generate summary for this document."}</p>
                </div>

                <!-- SECTION 2: Extracted Text (what was actually read) -->
                <div style="background:rgba(12,12,30,0.6); padding:22px; border-radius:14px; border:1px solid rgba(255,255,255,0.05); margin-bottom:20px;">
                    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px;">
                        <h4 style="color:var(--neon-blue); font-size:0.82rem; letter-spacing:1.2px; text-transform:uppercase; display:flex; align-items:center; gap:8px; margin:0;">
                            <span style="font-size:1rem;">📖</span> Extracted Content
                        </h4>
                        <span style="font-size:0.75rem; color:var(--text-dim);">${textLines.length} lines</span>
                    </div>
                    <div style="
                        background:rgba(0,0,0,0.3);
                        border:1px solid rgba(255,255,255,0.06);
                        border-radius:10px;
                        padding:18px;
                        max-height:300px;
                        overflow-y:auto;
                        font-family:'Courier New', Consolas, monospace;
                        font-size:0.88rem;
                        line-height:1.7;
                        color:#c8d2f0;
                        white-space:pre-wrap;
                        word-break:break-word;
                    ">${extractedTextSafe}</div>
                </div>

                <!-- SECTION 3: Structured Entities (grouped by category) -->
                <div style="background:rgba(12,12,30,0.6); padding:22px; border-radius:14px; border:1px solid rgba(255,255,255,0.05); margin-bottom:20px;">
                    <h4 style="color:var(--neon-blue); margin-bottom:16px; font-size:0.82rem; letter-spacing:1.2px; text-transform:uppercase; display:flex; align-items:center; gap:8px;">
                        <span style="font-size:1rem;">🏷️</span> Structured Information Extracted
                        <span style="font-size:0.72rem; color:var(--text-dim); font-weight:400; text-transform:none; letter-spacing:0;">(${res.entities ? res.entities.length : 0} entities found)</span>
                    </h4>
                    ${entitiesGroupedHTML}
                </div>

                <!-- SECTION 4: PII / Sensitive Data -->
                <div style="background:rgba(12,12,30,0.6); padding:22px; border-radius:14px; border:1px solid rgba(255,255,255,0.05); margin-bottom:20px;">
                    <h4 style="color:var(--neon-blue); margin-bottom:14px; font-size:0.82rem; letter-spacing:1.2px; text-transform:uppercase; display:flex; align-items:center; gap:8px;">
                        <span style="font-size:1rem;">🛡️</span> Sensitive / PII Data
                        ${res.pii && res.pii.length > 0
                            ? `<span style="font-size:0.72rem; color:#ff6b8a; font-weight:400; text-transform:none; letter-spacing:0;">(${res.pii.length} items detected & masked)</span>`
                            : '<span style="font-size:0.72rem; color:#00ff88; font-weight:400; text-transform:none; letter-spacing:0;">(None Found)</span>'
                        }
                    </h4>
                    ${res.pii && res.pii.length > 0 ? `
                    <table style="width:100%; border-collapse:collapse; text-align:left;">
                        <thead><tr>
                            <th style="padding:12px 14px; border-bottom:1px solid rgba(255,255,255,0.08); color:var(--text-dim); font-weight:500; font-size:0.82rem;">Type</th>
                            <th style="padding:12px 14px; border-bottom:1px solid rgba(255,255,255,0.08); color:var(--text-dim); font-weight:500; font-size:0.82rem;">Masked Value</th>
                            <th style="padding:12px 14px; border-bottom:1px solid rgba(255,255,255,0.08); color:var(--text-dim); font-weight:500; font-size:0.82rem;">Status</th>
                        </tr></thead>
                        <tbody>${piiHTML}</tbody>
                    </table>` : '<p style="color:#00ff88; font-size:0.9rem; display:flex; align-items:center; gap:8px;"><span style="font-size:1.1rem;">✅</span> No sensitive PII data detected. Document is clean and safe.</p>'}
                </div>

                <!-- SECTION 5: Overall Risk Assessment -->
                <div style="display:flex; align-items:flex-start; gap:20px; background:${riskStyle.bg}; padding:22px; border-radius:14px; border:1px solid ${riskStyle.border};">
                    <div style="min-width:140px;">
                        <h4 style="color:var(--text-dim); margin-bottom:10px; font-size:0.82rem; letter-spacing:1.2px; text-transform:uppercase;">🔒 Risk Level</h4>
                        <div style="
                            display:inline-block; padding:8px 18px; border-radius:10px;
                            font-size:0.95rem; font-weight:700; font-family:'Outfit',sans-serif;
                            background:${riskStyle.bg}; color:${riskStyle.color};
                            border:1px solid ${riskStyle.border};
                        ">${res.risk_level.toUpperCase()}</div>
                    </div>
                    <p style="font-size:0.9rem; color:#e0e0e0; flex:1; line-height:1.6; padding-top:4px;">
                        ${riskDescriptions[res.risk_level] || riskDescriptions['Low']}
                    </p>
                </div>
            `;
            container.appendChild(card);
        });

        // ── Download PDF Handler ──
        document.getElementById('downloadBtn').onclick = () => {
            if (!window.jspdf) {
                alert("PDF generation library not loaded. Please reload the page.");
                return;
            }
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            doc.setFontSize(20);
            doc.setTextColor(40, 40, 80);
            doc.text("SmartDocShield - Intelligence Report", 20, 20);
            doc.setFontSize(9);
            doc.setTextColor(120, 120, 140);
            doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 28);
            let yPos = 38;

            data.results.forEach((res, index) => {
                if (index > 0) { doc.addPage(); yPos = 20; }
                if (!res.success) return;

                doc.setFontSize(14);
                doc.setTextColor(40, 40, 80);
                doc.text(`File: ${res.filename}`, 20, yPos);
                yPos += 7;
                if (res.doc_type) {
                    doc.setFontSize(10);
                    doc.setTextColor(100, 100, 160);
                    doc.text(`Document Type: ${res.doc_type}    |    Risk: ${res.risk_level}`, 20, yPos);
                    yPos += 10;
                }

                // Summary
                doc.setFontSize(11);
                doc.setTextColor(40, 40, 80);
                doc.text("1. DOCUMENT SUMMARY", 20, yPos);
                yPos += 6;
                doc.setFontSize(9);
                doc.setTextColor(60, 60, 60);
                const splitSummary = doc.splitTextToSize(res.summary || "No summary available.", 170);
                doc.text(splitSummary, 20, yPos);
                yPos += (splitSummary.length * 5) + 8;

                // Extracted Text
                doc.setFontSize(11);
                doc.setTextColor(40, 40, 80);
                doc.text("2. EXTRACTED CONTENT", 20, yPos);
                yPos += 6;
                doc.setFontSize(8);
                doc.setTextColor(60, 60, 60);
                const textPreview = (res.extracted_text || res.raw_text || '').substring(0, 2000);
                const splitText = doc.splitTextToSize(textPreview, 170);
                const maxTextLines = Math.min(splitText.length, 40);
                doc.text(splitText.slice(0, maxTextLines), 20, yPos);
                yPos += (maxTextLines * 4) + 8;
                if (yPos > 260) { doc.addPage(); yPos = 20; }

                // Entities
                doc.setFontSize(11);
                doc.setTextColor(40, 40, 80);
                doc.text("3. STRUCTURED ENTITIES", 20, yPos);
                yPos += 7;
                doc.setFontSize(9);
                doc.setTextColor(60, 60, 60);
                if (res.entities && res.entities.length > 0) {
                    res.entities.forEach(ent => {
                        doc.text(`  [${ent.label}]  ${ent.text.substring(0, 80)}`, 20, yPos);
                        yPos += 5;
                        if (yPos > 275) { doc.addPage(); yPos = 20; }
                    });
                } else {
                    doc.text("  No named entities detected.", 20, yPos);
                    yPos += 5;
                }
                yPos += 6;

                // PII
                if (yPos > 250) { doc.addPage(); yPos = 20; }
                doc.setFontSize(11);
                doc.setTextColor(40, 40, 80);
                doc.text("4. SENSITIVE / PII DATA", 20, yPos);
                yPos += 7;
                doc.setFontSize(9);
                doc.setTextColor(60, 60, 60);
                if (res.pii && res.pii.length > 0) {
                    res.pii.forEach(p => {
                        let masked = p.value;
                        if (p.type === 'SSN') masked = 'XXX-XX-' + p.value.slice(-4);
                        else if (p.type === 'Phone') masked = '(XXX) XXX-' + p.value.slice(-4);
                        else if (p.type === 'Email') masked = p.value.replace(/(.{2}).*(@.*)/, '$1***$2');
                        else if (p.type === 'PAN Card') masked = 'XXXXX' + p.value.slice(5, 9) + 'X';
                        else if (p.type === 'Aadhaar') masked = 'XXXX XXXX ' + p.value.slice(-4);
                        doc.text(`  ${p.type}: ${masked}  [MASKED]`, 20, yPos);
                        yPos += 5;
                        if (yPos > 275) { doc.addPage(); yPos = 20; }
                    });
                } else {
                    doc.text("  No sensitive PII data detected.", 20, yPos);
                    yPos += 5;
                }
                yPos += 6;

                // Risk
                if (yPos > 260) { doc.addPage(); yPos = 20; }
                doc.setFontSize(11);
                doc.setTextColor(40, 40, 80);
                doc.text(`5. RISK LEVEL: ${res.risk_level.toUpperCase()}`, 20, yPos);
            });

            doc.save('SmartDocShield_Report.pdf');
        };

        try {
            const rawUser = localStorage.getItem('user');
            if (rawUser) {
                fetchDocumentHistory(JSON.parse(rawUser).username);
            }
        } catch(e) {}

        setTimeout(() => resultsPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
    }
}

/* ============================================
   5. Login Modal — API-Integrated OTP System
   ============================================ */

// API base URL — Flask backend
const API_BASE = window.location.origin;

// Store the current login email for OTP verification
let currentLoginEmail = '';

/**
 * Show a toast / inline error message inside the modal.
 */
function showModalError(message, type = 'error') {
    let toast = document.getElementById('modalToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'modalToast';
        toast.style.cssText = `
            padding: 10px 16px;
            border-radius: 10px;
            font-family: 'Inter', sans-serif;
            font-size: 0.82rem;
            margin-bottom: 16px;
            text-align: center;
            animation: slideUp 0.3s ease-out;
            line-height: 1.5;
        `;
        const modalContent = document.querySelector('.modal-content');
        const firstForm = document.getElementById('loginStep1');
        modalContent.insertBefore(toast, firstForm);
    }

    if (type === 'error') {
        toast.style.background = 'rgba(255,51,119,0.12)';
        toast.style.border = '1px solid rgba(255,51,119,0.25)';
        toast.style.color = '#ff6b8a';
    } else if (type === 'success') {
        toast.style.background = 'rgba(0,255,136,0.1)';
        toast.style.border = '1px solid rgba(0,255,136,0.2)';
        toast.style.color = '#00ff88';
    } else {
        toast.style.background = 'rgba(0,212,255,0.1)';
        toast.style.border = '1px solid rgba(0,212,255,0.2)';
        toast.style.color = '#00d4ff';
    }

    toast.textContent = message;
    toast.style.display = 'block';

    // Auto-hide after 8 seconds
    clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(() => {
        toast.style.display = 'none';
    }, 8000);
}

function hideModalError() {
    const toast = document.getElementById('modalToast');
    if (toast) toast.style.display = 'none';
}

/**
 * Set button loading state
 */
function setBtnLoading(btn, loading, originalHTML) {
    if (loading) {
        btn.disabled = true;
        btn.dataset.originalHtml = btn.innerHTML;
        btn.innerHTML = `
            <span class="btn-glow"></span>
            <span class="proc-spinner" style="width:18px;height:18px;border-width:2px;display:inline-block;vertical-align:middle;margin-right:8px;"></span>
            <span>Please wait...</span>
        `;
        btn.style.opacity = '0.7';
        btn.style.pointerEvents = 'none';
    } else {
        btn.disabled = false;
        btn.innerHTML = originalHTML || btn.dataset.originalHtml || '';
        btn.style.opacity = '';
        btn.style.pointerEvents = '';
    }
}

function initLoginModal() {
    const modal = document.getElementById('loginModal');
    const loginBtns = [
        document.getElementById('navLoginBtn'),
        document.getElementById('heroLoginBtn')
    ];
    const signupBtns = [
        document.getElementById('navSignupBtn'),
        document.getElementById('heroSignupBtn')
    ];
    const closeBtn = document.getElementById('modalClose');
    const authForm = document.getElementById('authForm');
    const authSubmitBtn = document.getElementById('authSubmitBtn');
    const authBtnText = document.getElementById('authBtnText');
    const toggleAuthModeBtn = document.getElementById('toggleAuthModeBtn');
    const usernameGroup = document.getElementById('usernameGroup');
    const usernameInput = document.getElementById('usernameInput');
    const nameGroup = document.getElementById('nameGroup');
    const nameInput = document.getElementById('nameInput');
    const emailGroup = document.getElementById('emailGroup');
    const emailInput = document.getElementById('emailInput');
    const authTitle = document.getElementById('authTitle');
    const authSubtitle = document.getElementById('authSubtitle');
    const authToggleText = document.getElementById('authToggleText');

    let isLoginMode = true;
    const authOriginalHTML = authSubmitBtn.innerHTML;

    // Helper to switch modal state visually
    const setModalState = (modeIsLogin) => {
        isLoginMode = modeIsLogin;
        hideModalError();
        if (isLoginMode) {
            authTitle.textContent = 'Secure Login';
            authSubtitle.textContent = 'Access your intelligence dashboard';
            nameGroup.style.display = 'none';
            emailGroup.style.display = 'none';
            usernameGroup.style.display = 'block';
            authBtnText.textContent = 'Log In';
            authToggleText.innerHTML = `Don't have an account? <a href="#" id="toggleAuthModeBtnInner">Sign Up</a>`;
        } else {
            authTitle.textContent = 'Create Account';
            authSubtitle.textContent = 'Join the intelligence platform';
            nameGroup.style.display = 'block';
            emailGroup.style.display = 'block';
            usernameGroup.style.display = 'block';
            authBtnText.textContent = 'Sign Up';
            authToggleText.innerHTML = `Already have an account? <a href="#" id="toggleAuthModeBtnInner">Log In</a>`;
        }
        document.getElementById('toggleAuthModeBtnInner')?.addEventListener('click', (eInner) => {
            eInner.preventDefault();
            setModalState(!isLoginMode);
        });
    };

    // ── Open modal ──
    loginBtns.forEach(btn => {
        if (btn) btn.addEventListener('click', () => {
            modal.classList.add('active');
            setModalState(true);
            console.log('[SmartDocShield] Auth modal opened (Login Mode)');
        });
    });

    signupBtns.forEach(btn => {
        if (btn) btn.addEventListener('click', () => {
            modal.classList.add('active');
            setModalState(false);
            console.log('[SmartDocShield] Auth modal opened (Signup Mode)');
        });
    });

    // ── Close modal ──
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        hideModalError();
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            hideModalError();
        }
    });

    // ── Toggle Password Visibility ──
    const togglePasswordBtn = document.getElementById('togglePasswordBtn');
    const passwordInput = document.getElementById('passwordInput');
    const eyeClosed = document.querySelector('.eye-closed');
    const eyeOpen = document.querySelector('.eye-open');

    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', () => {
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                eyeClosed.style.display = 'none';
                eyeOpen.style.display = 'block';
            } else {
                passwordInput.type = 'password';
                eyeClosed.style.display = 'block';
                eyeOpen.style.display = 'none';
            }
        });
    }

    // ── Toggle Login / Signup Mode ──
    toggleAuthModeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        setModalState(!isLoginMode);
    });

    // ── Submit Auth Form ──
    authSubmitBtn.addEventListener('click', async () => {
        const username = usernameInput.value.trim();
        const pass = document.getElementById('passwordInput').value;
        const name = nameInput.value.trim();
        const email = emailInput.value.trim().toLowerCase();

        hideModalError();

        if (!username) {
            showModalError('Please enter a username.');
            return;
        }
        if (!pass || pass.length < 4) {
            showModalError('Password must be at least 4 characters.');
            return;
        }

        if (!isLoginMode) {
            if (!name) {
                showModalError('Please enter your full name.');
                return;
            }
            if (!email || !email.includes('@')) {
                showModalError('Please enter a valid email address.');
                return;
            }
        }

        const endpoint = isLoginMode ? '/api/login' : '/api/signup';
        const payload = { username: username, password: pass };
        
        if (!isLoginMode) {
            payload.name = name;
            payload.email = email;
        }

        console.log(`[SmartDocShield] Sending auth request to ${endpoint}...`);
        setBtnLoading(authSubmitBtn, true);

        try {
            const response = await fetch(`${API_BASE}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (result.success) {
                if (result.user) localStorage.setItem('user', JSON.stringify(result.user));
                setBtnLoading(authSubmitBtn, false);
                authSubmitBtn.innerHTML = '<span class="btn-glow"></span><span>✓ Success!</span>';
                authSubmitBtn.style.background = 'linear-gradient(135deg, #00ff88, #00d4ff)';
                console.log(`[SmartDocShield] ✅ Auth successful`);

                setTimeout(() => {
                    modal.classList.remove('active');
                    window.location.reload(); // Reload SPA to implicitly trigger initSessionManagement!
                }, 1000);
            } else {
                showModalError(result.error || 'Authentication failed. Please try again.');
            }
        } catch (err) {
            console.error('[SmartDocShield] ❌ Network error:', err);
            showModalError('Cannot connect to server. Ensure backend is running.');
        } finally {
            if (authSubmitBtn.textContent !== '✓ Success!') {
                setBtnLoading(authSubmitBtn, false, authOriginalHTML);
                // Resync button text
                authBtnText.textContent = isLoginMode ? 'Log In' : 'Sign Up';
            }
        }
    });

    // ── Explore button ──
    const exploreBtn = document.getElementById('exploreBtn');
    if (exploreBtn) {
        exploreBtn.addEventListener('click', () => {
            document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
        });
    }
}

/* ============================================
   6. OTP Input Auto-focus
   ============================================ */

function initOTPInputs() {
    // Deprecated explicitly by user prompt
}

/* ============================================
   7. Stat Counter Animation
   ============================================ */

function initStatCounters() {
    const counters = document.querySelectorAll('.stat-value[data-count]');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseFloat(el.dataset.count);
                const isDecimal = target % 1 !== 0;
                const duration = 2000;
                const steps = 60;
                const increment = target / steps;
                let current = 0;
                let step = 0;

                const timer = setInterval(() => {
                    step++;
                    // Ease out
                    const progress = step / steps;
                    const eased = 1 - Math.pow(1 - progress, 3);
                    current = target * eased;

                    el.textContent = isDecimal ? current.toFixed(1) : Math.round(current);

                    if (step >= steps) {
                        el.textContent = isDecimal ? target.toFixed(1) : target;
                        clearInterval(timer);
                    }
                }, duration / steps);

                observer.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(c => observer.observe(c));
}

/* ============================================
   8. Connection Lines Between Cards
   ============================================ */

function initConnectionLines() {
    const canvas = document.getElementById('connectionCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const section = canvas.closest('.features-section');

    function draw() {
        const rect = section.getBoundingClientRect();
        canvas.width = section.offsetWidth;
        canvas.height = section.offsetHeight;

        const cards = document.querySelectorAll('.feature-card');
        if (cards.length < 2) return;

        const positions = [];
        cards.forEach(card => {
            const cardRect = card.getBoundingClientRect();
            const sectionRect = section.getBoundingClientRect();
            positions.push({
                x: cardRect.left - sectionRect.left + cardRect.width / 2,
                y: cardRect.top - sectionRect.top + cardRect.height / 2
            });
        });

        // Draw flowing connections between sequential cards
        for (let i = 0; i < positions.length - 1; i++) {
            const from = positions[i];
            const to = positions[i + 1];

            const gradient = ctx.createLinearGradient(from.x, from.y, to.x, to.y);
            gradient.addColorStop(0, 'rgba(0, 212, 255, 0.08)');
            gradient.addColorStop(0.5, 'rgba(180, 76, 255, 0.06)');
            gradient.addColorStop(1, 'rgba(0, 212, 255, 0.08)');

            ctx.beginPath();
            ctx.moveTo(from.x, from.y);

            // Bezier curve for smooth connection
            const midX = (from.x + to.x) / 2;
            const midY = (from.y + to.y) / 2;
            const controlOffset = 30;
            ctx.quadraticCurveTo(midX, midY - controlOffset, to.x, to.y);

            ctx.strokeStyle = gradient;
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 6]);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }

    // Debounced redraw
    let resizeTimer;
    function scheduleRedraw() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(draw, 100);
    }

    window.addEventListener('resize', scheduleRedraw);
    window.addEventListener('scroll', scheduleRedraw);

    // Initial draw after cards are positioned
    setTimeout(draw, 500);
    setTimeout(draw, 1500);
}

/* ============================================
   9. Smooth Scroll for Nav Links
   ============================================ */

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}
