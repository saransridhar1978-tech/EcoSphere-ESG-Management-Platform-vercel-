/** @odoo-module **/

// EcoSphere AI - Core OWL Dashboard Controller
// Designed to run inside Odoo's OWL framework or fall back to standard web launcher

(function() {
    const defaultState = {
        theme: 'dark',
        sim_solar: 120,
        sim_hybrid: 40,
        sim_ev: 20,
        proj_carbon: 32.5,
        proj_savings: 18400,
        proj_esg: 5.4,
        user_xp: 240,
        user_level: 3,
        user_coins: 1250,
        user_avatar: 'Plant',
        csr_budget: 8000,
        csr_objective: 'planting',
        csr_result: '',
        copilot_open: false,
        chat_input: '',
        chat_history: [
            { id: 1, sender: 'assistant', text: "Hello! I am EcoSphere AI Copilot. How can I assist you with your ESG operations today?" }
        ],
        suppliers: [
            { id: 1, name: "EcoBox Solutions", score: 94, carbon: 45, distance: 30 },
            { id: 2, name: "GreenTransit Corp", score: 88, carbon: 75, distance: 65 },
            { id: 3, name: "Apex Packaging", score: 58, carbon: 140, distance: 180 },
            { id: 4, name: "Acme Logistics", score: 52, carbon: 195, distance: 290 }
        ],
        risk_departments: [
            { id: 1, name: "Logistics & Fleet", score: 58, level: "High" },
            { id: 2, name: "Manufacturing", score: 45, level: "Medium" },
            { id: 3, name: "Purchasing", score: 38, level: "Medium" },
            { id: 4, name: "Administration", score: 12, level: "Low" }
        ],
        news: [
            { id: 1, title: "EU Corporate Sustainability Due Diligence (CSDDD)", summary: "Mandatory scope 3 value-chain compliance audit requirements start next year.", impact: "High. Supply chain auditing needed.", deadline: "Jan 2027" },
            { id: 2, title: "New Green Fleet Subsidy Program", summary: "Government offering 25% tax credits on fleet electric vehicle conversions.", impact: "Positive. ROI on EV simulator will improve.", deadline: "Dec 2026" }
        ]
    };

    class EcoSphereDashboard {
        constructor(domElement) {
            this.dom = domElement;
            this.state = JSON.parse(JSON.stringify(defaultState));
            this.chart = null;
            this.init();
        }

        init() {
            this.render();
            this.initCharts();
            this.bindEvents();
        }

        render() {
            // High fidelity render simulation for the standalone preview
            if (!this.dom) return;
            
            // Check body classes for theme
            document.documentElement.setAttribute('data-theme', this.state.theme);
        }

        toggleTheme() {
            this.state.theme = this.state.theme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', this.state.theme);
            const body = document.querySelector('body');
            if (this.state.theme === 'light') {
                body.style.backgroundColor = '#f0fdf4';
                body.style.color = '#111827';
            } else {
                body.style.backgroundColor = '#0b1511';
                body.style.color = '#f3f4f6';
            }
        }

        recalculateTwin() {
            const solar = parseInt(this.state.sim_solar);
            const hybrid = parseInt(this.state.sim_hybrid);
            const ev = parseInt(this.state.sim_ev);

            // Predict metrics based on combinations
            this.state.proj_carbon = ((solar * 0.15) + (hybrid * 0.8) + (ev * 1.2)).toFixed(1);
            this.state.proj_savings = Math.round((solar * 110) + (hybrid * 280) + (ev * 450));
            this.state.proj_esg = ((solar * 0.02) + (hybrid * 0.05) + (ev * 0.08)).toFixed(1);

            // Update UI elements directly
            document.getElementById('lbl_sim_solar').innerText = solar + ' kW';
            document.getElementById('lbl_sim_hybrid').innerText = hybrid + '%';
            document.getElementById('lbl_sim_ev').innerText = ev + '%';

            document.getElementById('val_proj_carbon').innerText = this.state.proj_carbon + ' t/yr';
            document.getElementById('val_proj_savings').innerText = '$' + this.state.proj_savings.toLocaleString();
            document.getElementById('val_proj_esg').innerText = '+' + this.state.proj_esg + ' pts';
        }

        suggestAlternative(supplierId) {
            alert("AI Action: Swapping supplier with Acme Logistics (Score 52) to EcoBox Solutions (Score 94). This will reduce Scope 3 transport emissions by 74% and yield +12.4t carbon reduction!");
            this.state.user_xp += 50;
            this.state.user_coins += 200;
            this.updateGamification();
        }

        updateGamification() {
            this.state.user_level = Math.floor(this.state.user_xp / 100) + 1;
            if (this.state.user_level <= 2) this.state.user_avatar = "Seed";
            else if (this.state.user_level <= 5) this.state.user_avatar = "Plant";
            else this.state.user_avatar = "Tree";

            document.getElementById('val_xp_info').innerText = `Level ${this.state.user_level} (XP: ${this.state.user_xp} / ${this.state.user_level * 100})`;
            document.getElementById('val_coins_info').innerText = `${this.state.user_coins} Eco Coins`;
            document.getElementById('val_avatar_status').innerText = this.state.user_avatar;
        }

        redeemCoins() {
            if (this.state.user_coins >= 500) {
                this.state.user_coins -= 500;
                alert("Successfully redeemed: 'Tree planted in your name in EcoSphere Forest (+50 XP)!'");
                this.state.user_xp += 50;
                this.updateGamification();
            } else {
                alert("Insufficient Eco Coins! You need at least 500 Eco Coins to redeem rewards.");
            }
        }

        planCSR() {
            const budget = document.getElementById('csr_budget_input').value;
            const obj = document.getElementById('csr_objective_select').value;
            
            let campaign = "";
            if (obj === "planting") {
                campaign = `EcoSphere GreenCanopy Campaign. Plant approx ${Math.round(budget/15)} trees in suburban parks. Predicted participation: 74%, ESG boost: +4.2 pts.`;
            } else if (obj === "recycling") {
                campaign = `Office E-Waste & Circularity Drive. Recycle company hardware & waste. Expected participation: 82%, ESG boost: +2.8 pts.`;
            } else {
                campaign = `Scope 1 Smart Insulation Project. Upgrade thermostat units & windows. Predicted energy cost reduction: 14%, ESG boost: +5.1 pts.`;
            }

            document.getElementById('csr_result_box').innerText = campaign;
            document.getElementById('csr_result_container').style.display = 'block';
        }

        toggleCopilot() {
            const panel = document.getElementById('copilot-panel');
            if (panel.style.display === 'none' || !panel.style.display) {
                panel.style.display = 'flex';
                this.state.copilot_open = true;
            } else {
                panel.style.display = 'none';
                this.state.copilot_open = false;
            }
        }

        handleKey(e) {
            if (e.key === 'Enter') {
                this.sendChat();
            }
        }

        sendPrompt(text) {
            document.getElementById('chat_input_field').value = text;
            this.sendChat();
        }

        async sendChat() {
            const input = document.getElementById('chat_input_field');
            const text = input.value.trim();
            if (!text) return;

            // Append User Msg
            this.appendMessage('user', text);
            input.value = '';

            try {
                const response = await fetch('/ecosphere/copilot/query', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ prompt: text })
                });
                const data = await response.json();
                
                // If backend returns data, render it.
                this.appendMessage('assistant', data.answer, data.chart);
            } catch (error) {
                console.error("Failed to query prototype backend:", error);
                // Fallback to offline logic
                setTimeout(() => {
                    let reply = "";
                    let chart = null;
                    const txtLower = text.toLowerCase();

                    if (txtLower.includes("carbon") || txtLower.includes("emission")) {
                        reply = "Carbon emissions increased by 4.2% last month primarily due to increased manufacturing activity in Production Line B and a 12% rise in logistics freight distances.";
                        chart = {
                            type: 'bar',
                            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                            data: [42, 45, 41, 44, 48, 50]
                        };
                    } else if (txtLower.includes("supplier") || txtLower.includes("sustain")) {
                        reply = "Currently, Acme Logistics and Apex Packaging have the lowest ESG sustainability ratings (52 and 58 respectively). I recommend transitioning logistics partners.";
                    } else if (txtLower.includes("risk") || txtLower.includes("department")) {
                        reply = "The Logistics & Fleet Department exhibits the highest overall ESG risk (58%) due to diesel transport emissions.";
                    } else {
                        reply = "I've analyzed our organizational ESG metrics. I suggest evaluating smart insulation panels to save electricity footprint.";
                    }

                    this.appendMessage('assistant', reply, chart);
                }, 800);
            }
        }

        appendMessage(sender, text, chartData = null) {
            const container = document.getElementById('copilot-messages');
            const msgDiv = document.createElement('div');
            msgDiv.className = `p-3 rounded-lg max-w-[85%] ${sender === 'user' ? 'bg-emerald-600 text-white ml-auto' : 'bg-gray-900 text-gray-200 mr-auto'}`;
            
            const p = document.createElement('p');
            p.className = 'whitespace-pre-wrap';
            p.innerText = text;
            msgDiv.appendChild(p);

            if (chartData) {
                const chartContainer = document.createElement('div');
                chartContainer.className = 'mt-2 bg-black/40 p-2 rounded border border-gray-800';
                chartContainer.style.height = '100px';
                
                const canvasId = 'chart-dyn-' + Date.now();
                const canvas = document.createElement('canvas');
                canvas.id = canvasId;
                chartContainer.appendChild(canvas);
                msgDiv.appendChild(chartContainer);

                setTimeout(() => {
                    new Chart(document.getElementById(canvasId).getContext('2d'), {
                        type: chartData.type,
                        data: {
                            labels: chartData.labels,
                            datasets: [{
                                label: 'CO2e (tonnes)',
                                data: chartData.data,
                                backgroundColor: '#10b981'
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { display: false } }
                        }
                    });
                }, 100);
            }

            container.appendChild(msgDiv);
            container.scrollTop = container.scrollHeight;
        }

        exportReport(format) {
            alert(`Generating & Exporting full Autonomous ESG Report in ${format.toUpperCase()} format...\nIncludes Carbon Ledger, Supplier Index, CSR Outlook, Risk Analytics, and AI explanations.`);
        }

        initCharts() {
            const ctx = document.getElementById('carbonTrendChart').getContext('2d');
            this.chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                    datasets: [
                        {
                            label: 'Purchasing (Scope 3)',
                            data: [35, 34, 38, 30, 29, 28, 25],
                            borderColor: '#10b981',
                            tension: 0.4
                        },
                        {
                            label: 'Manufacturing (Scope 1)',
                            data: [50, 48, 52, 45, 47, 43, 40],
                            borderColor: '#06b6d4',
                            tension: 0.4
                        },
                        {
                            label: 'Electricity (Scope 2)',
                            data: [25, 23, 24, 21, 20, 18, 17],
                            borderColor: '#f59e0b',
                            tension: 0.4
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            grid: { color: 'rgba(255,255,255,0.05)' },
                            ticks: { color: '#9ca3af' }
                        },
                        x: {
                            grid: { color: 'rgba(255,255,255,0.05)' },
                            ticks: { color: '#9ca3af' }
                        }
                    },
                    plugins: {
                        legend: {
                            labels: { color: '#f3f4f6' }
                        }
                    }
                }
            });
        }

        bindEvents() {
            // Theme toggle
            document.querySelector('.theme-toggle-btn').addEventListener('click', () => this.toggleTheme());
            
            // Simulator Inputs
            document.getElementById('sim_solar').addEventListener('input', () => this.recalculateTwin());
            document.getElementById('sim_hybrid').addEventListener('input', () => this.recalculateTwin());
            document.getElementById('sim_ev').addEventListener('input', () => this.recalculateTwin());

            // CSR Button
            document.getElementById('btn_plan_csr').addEventListener('click', () => this.planCSR());

            // Coin Redemeer
            document.getElementById('btn_redeem_coins').addEventListener('click', () => this.redeemCoins());

            // Copilot Toggle
            document.querySelector('.copilot-bubble').addEventListener('click', () => this.toggleCopilot());
            document.getElementById('btn_close_copilot').addEventListener('click', () => this.toggleCopilot());

            // Copilot Chat Trigger
            document.getElementById('btn_send_chat').addEventListener('click', () => this.sendChat());
            document.getElementById('chat_input_field').addEventListener('keydown', (e) => this.handleKey(e));
        }
    }

    // Export to global scope for standalone launcher binding
    window.EcoSphere = EcoSphereDashboard;
})();
