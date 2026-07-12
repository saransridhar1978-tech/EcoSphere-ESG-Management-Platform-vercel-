import http.server
import socketserver
import os
import sys
import json
import urllib.parse

PORT = 8069

class EcoSphereDemoHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        # Clean logging
        sys.stderr.write("%s - - [%s] %s\n" % (self.address_string(), self.log_date_time_string(), format%args))

    def end_headers(self):
        # Enable CORS and caching rules
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

    def do_GET(self):
        parsed_url = urllib.parse.urlparse(self.path)
        if parsed_url.path == '/ecosphere/esg_summary':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            summary_data = {
                "status": "success",
                "overall_esg_score": 84.5,
                "environmental_score": 81.2,
                "social_score": 88.0,
                "governance_score": 84.3,
                "carbon_reduction_ytd": "12.4%",
                "active_employees_gamified": 184,
                "compliance_status": "92%"
            }
            self.wfile.write(json.dumps(summary_data).encode('utf-8'))
        else:
            super().do_GET()

    def do_POST(self):
        parsed_url = urllib.parse.urlparse(self.path)
        if parsed_url.path == '/ecosphere/copilot/query':
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            try:
                params = json.loads(post_data.decode('utf-8'))
            except Exception:
                params = {}
            
            prompt = params.get('prompt', '')
            prompt_lower = prompt.lower()
            
            chart_data = None
            if "carbon" in prompt_lower or "emission" in prompt_lower:
                answer = "Carbon emissions increased by 4.2% last month primarily due to increased manufacturing activity in Production Line B and a 12% rise in logistics freight distances. I recommend transitioning production shifts to off-peak renewable hours and optimizing shipping routes."
                chart_data = {
                    "type": "bar",
                    "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
                    "data": [42, 45, 41, 44, 48, 50]
                }
            elif "supplier" in prompt_lower or "sustain" in prompt_lower:
                answer = "Currently, Acme Logistics and Apex Packaging have the lowest ESG sustainability ratings (52 and 58 respectively) due to non-recyclable materials and long shipping distances. I recommend switching to EcoBox Solutions (rating 94) to reduce scope 3 emissions."
            elif "risk" in prompt_lower or "department" in prompt_lower:
                answer = "The Logistics Department exhibits the highest overall ESG risk (58%) due to heavy fleet emissions and regulatory compliance exposure under new green transit rules. The HR department holds the lowest risk (12%)."
                chart_data = {
                    "type": "radar",
                    "labels": ["Compliance", "Environmental", "Governance", "Employee", "CSR"],
                    "data": [65, 80, 45, 50, 50]
                }
            elif "predict" in prompt_lower or "next month" in prompt_lower:
                answer = "Predictive analysis indicates a potential 3.5 point increase in our ESG Health Score (to 88.0) if the Solar Phase 1 installation completes on schedule. Under current baseline operations, the score is projected to hold steady at 84.5."
                chart_data = {
                    "type": "line",
                    "labels": ["Current", "Aug (Proj)", "Sep (Proj)", "Oct (Proj)"],
                    "data": [84.5, 85.1, 86.8, 88.0]
                }
            else:
                answer = "I've analyzed our organizational ESG metrics. Here are the top three suggested actions to reduce footprint:\n1. Transition fleet to hybrid/EV models.\n2. Mandate the Green Office standard (hybrid work expansion).\n3. Re-evaluate Tier-2 suppliers on packaging practices."
            
            response_data = {
                "answer": answer,
                "chart": chart_data,
                "suggestions": [
                    "Why did carbon emissions increase this month?",
                    "Which department has the highest ESG risk?",
                    "Suggest methods to reduce emissions."
                ]
            }
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(response_data).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

if __name__ == '__main__':
    print("====================================================")
    print("      EcoSphere AI ESG Management Demo Server      ")
    print("====================================================")
    print(f"Starting server at: http://localhost:{PORT}")
    print("Press Ctrl+C to terminate the server session.")
    print("====================================================")
    
    # Change working directory to script location
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    # Allow address reuse
    socketserver.TCPServer.allow_reuse_address = True
    
    with socketserver.TCPServer(("", PORT), EcoSphereDemoHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down EcoSphere AI demo server.")
            sys.exit(0)

