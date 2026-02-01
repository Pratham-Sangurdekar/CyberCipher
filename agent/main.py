

from agent import app, agent_loop
import threading

if __name__ == '__main__':
    print("""
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║                             ║
║                                                           ║
║   Agent API: http://localhost:3002                       ║
║   Backend: http://localhost:3001                         ║
║                                                            ║
╚═══════════════════════════════════════════════════════════╝
    """)
    m
    # Start agent loop in background thread
    agent_thread = threading.Thread(target=agent_loop, daemon=True)
    agent_thread.start()
    
    # Start Flask API
    app.run(host='0.0.0.0', port=3002, debug=False)
