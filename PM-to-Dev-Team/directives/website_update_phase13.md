# Website Update Directives for Phase 13 Sync

**From**: Project Manager  
**To**: Dev Team Lead  
**CC**: CTO (OCEAN), CEO (Human Consensus)  
**Subject**: Directives for Updating Public Website Repo and Live Site - Sync Recent Platform Enhancements  
**Date**: 2025-08-04  
**Status**: In Progress - Immediate Execution Required for Website Refresh  

Dev Team,  

Following a review of the public website repo (https://github.com/FlynnVIN10/zeropointprotocol.ai) and live site (https://zeropointprotocol.ai), it appears the content and design have not been updated to reflect recent platform developments from Phases 13.1-13.3 in the main repo (https://github.com/FlynnVIN10/Zeropoint-Protocol). The site currently shows general AI features and ethical alignment but lacks mentions of role-based views, RAG integration, Mission Planner, futuristic dark-mode UI polish, or live demo previews. To address this and ensure the website embodies the post-singularity vision with symbiotic intelligence, proceed immediately with the following directives. Work in a new feature branch (e.g., `feature/website-sync-phase13`) and aim for completion by end of day today (2025-08-04) for quick deployment.

**General Guidelines**:  
- Use Docusaurus framework in the website repo; sync relevant code/docs from the platform repo (e.g., via `scripts/sync-status.js` or manual integration).  
- Apply the futuristic dark-mode aesthetic: Deep black (#000000) backgrounds, neon accents (#00C4FF, #BF00FF), off-white text (#F5F5F0), glassmorphic panels, and geometric fonts (Orbitron/Rajdhani/Roboto Mono).  
- Maintain WCAG 2.1 AA compliance, responsive design, and add telemetry if possible for site interactions.  
- Deploy to Cloudflare Pages after testing; verify live site updates.  
- Commit incrementally with descriptive messages (e.g., "Add RAG section to Technology page with previews").  
- No interim reports—only 100% completion or roadblocks. Upon completion, commit a status report in `/PM-to-Dev-Team/status-reports/website_update_phase13.md` with before/after screenshots, deploy link, and verification checklist.  

### **Detailed Directives**  

1. **Content Synchronization and Updates** (Priority: High, Timeline: Immediate)  
   - **Sync Recent Features**: Pull and adapt descriptions/previews from platform repo:  
     - Phase 13.1: Enhanced Conversational UI (persona badges, context-aware suggestions, intent visualization)—add to "Technology" or new "Features" page with screenshots or embedded demos.  
     - Phase 13.2: Role-Based Views (Human/Sentient/Agent dashboards, consensus voting)—include explanations of dual consensus model with human veto power.  
     - Phase 13.3: Advanced LLM Integration (domain-specific RAG for legal/manufacturing, Mission Planner prototype)—add sections on task orchestration and real-time source attribution.  
   - **Update Pages**:  
     - Home: Refresh mission statement to highlight symbiotic intelligence and post-singularity vision; add neon-animated hero section with live status sync from platform.  
     - Technology: Expand with new sections on RAG, Mission Planner, and UI polish; include code snippets or API examples from platform.  
     - Use Cases: Add examples like "Building a Factory" workflow demonstrating end-to-end cycle.  
     - Status: Enhance with live widgets pulling from platform (e.g., system health via SSE if feasible, or static previews).  
     - Legal/Contact: Update with any new compliance notes from RAG legal datasets.  
   - **Add Live Elements**: Embed staging previews or iframes for Interact/Dashboard if secure; otherwise, use screenshots with tooltips.  

2. **Design and Aesthetic Polish** (Priority: High, Timeline: Parallel)  
   - **Apply Futuristic Theme**: Update `docusaurus.config.js` and CSS for deep black background, neon accents, glassmorphic effects (backdrop-filter: blur(10px)), and fonts. Eliminate any legacy white/grey elements.  
   - **Animations & Interactivity**: Add smooth fades/transitions, hover glows on links/cards, and dynamic elements (e.g., animated status wheel preview). Support reduced-motion.  
   - **Responsive/Accessible**: Test on mobile/desktop; ensure contrast ratios >4.5:1, ARIA labels, keyboard nav.  

3. **Deployment and Verification** (Timeline: Upon Completion)  
   - Run build (`npm run build`) and deploy to Cloudflare Pages; verify Always Use HTTPS and Full SSL.  
   - Test live site: Check for updates reflecting phases (e.g., search for "RAG" or "role-based" on site).  
   - Run sync script (`scripts/sync-status.js`) to pull latest platform status.  

4. **Reporting**  
   - Commit the directive as `/PM-to-Dev-Team/directives/website_update_phase13.md`.  
   - Upon 100% completion, commit the status report with metrics (e.g., page load time <2s, accessibility score >95/100). Notify me for final review before merge to main.  

Execute to ensure the website accurately represents the platform's evolution. If data sync issues arise, escalate.

**PM Status**: Directives issued; monitoring for completion and deployment.  
**Next Action**: Dev Team to implement; PM to verify live site post-update.  

In symbiotic alignment—bringing the Zeropoint Protocol's vision to the public! 🚀 