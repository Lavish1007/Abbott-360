/* Executive Hub — daily decision workspace for client executives */
let executiveAssistantState={team:currentBusinessRole,need:"Role-specific intelligence brief",region:"Global"};

function execDaily(){return (window.EXECUTIVE_DAILY_DATA&&EXECUTIVE_DAILY_DATA[currentDomain])||{macro:[],buzz:[],questions:[]}}
function execPmr(){return (window.PMR_DEMO_DATA&&PMR_DEMO_DATA[currentDomain])||null}
function execNews(){
  return ((window.CI_NEWS_RESEARCH&&CI_NEWS_RESEARCH[currentDomain])||[])
    .filter(n=>String(n.date||"")>="2025-09-18")
    .sort((a,b)=>String(b.date).localeCompare(String(a.date)));
}
function execPriority(n){
  if(["Regulatory Milestone","Clinical Trial Update","M&A"].includes(n.milestone))return "High";
  if(["Leadership Changes","Partnership, M&A","Clinical, R&D"].includes(typeof ciTheme==="function"?ciTheme(n):n.theme))return "Medium";
  return "Routine";
}
function execCurrentPmrProjects(){
  const d=execPmr();return d?(d.projects||[]).filter(p=>p.status&&p.status!=="Completed"):[];
}
function execUrgentSignals(){
  const news=execNews().filter(n=>execPriority(n)!=="Routine").slice(0,3),pmr=execCurrentPmrProjects().slice(0,2),st=typeof executiveStrategy==="function"?executiveStrategy():{};
  const items=[];
  news.forEach(n=>items.push({kind:"Competitive signal",priority:execPriority(n),title:n.title,detail:n.summary,date:n.date,action:"Review implications and confirm whether a response, deeper research or stakeholder communication is required.",url:n.url}));
  pmr.forEach(p=>items.push({kind:"PMR milestone",priority:p.health==="Watch"?"High":"Medium",title:p.name,detail:p.stage+" · "+p.progress+"% complete",date:p.end,action:p.nextMilestone||"Review current project milestone and unblock next step.",route:"pmr"}));
  (st.risks||[]).slice(0,1).forEach(r=>items.push({kind:"Market risk",priority:r.importance||"Medium",title:r.title,detail:r.text,date:"Current",action:"Track exposure and validate whether the risk changes near-term priorities.",route:"industry"}));
  return items.slice(0,6);
}
function execTeamOptions(){return [currentBusinessRole]}
function execNeedOptions(){
  const map={
    "Executive Leadership Team":["Executive decision brief","Growth & risk priorities","Competitive update","Portfolio performance","Market opportunity"],
    "Product & Portfolio Management Team":["Portfolio opportunity","Product / feature benchmark","Customer unmet need","Lifecycle priority","Competitive product update"],
    "Marketing, Branding & Commercial Excellence Team":["Commercial opportunity","Brand / positioning signal","Pricing & reimbursement intelligence","Customer / VOC insight","Channel & GTM update"],
    "Strategy & Business Development Team":["Market attractiveness","Partnership / M&A signal","Adjacency opportunity","Competitor strategy","Growth scenario"],
    "Medical & Clinical Affairs, R&D & Innovation Team":["Clinical evidence update","Unmet need","Innovation / technology signal","Workflow opportunity","R&D priority"]
  }; return map[currentBusinessRole]||["Role-specific intelligence brief"];
}
function updateExecutiveAssistant(key,value){executiveAssistantState[key]=value}
function execSelect(label,key,values,value){
  return '<label>'+esc(label)+'<select onchange="updateExecutiveAssistant(\''+key+'\',this.value)">'+values.map(v=>'<option '+(v===value?'selected':'')+'>'+esc(v)+'</option>').join('')+'</select></label>';
}
function execStatusBadge(priority){return '<span class="exec-priority '+String(priority).toLowerCase()+'">'+esc(priority)+' priority</span>'}
function execVisualIcon(kind){
  const map={"Competitive signal":"↗","PMR milestone":"◎","Market risk":"!","signal":"◆","pmr":"◌","macro":"◫","customer":"◉","assistant":"✦"};
  return '<span class="exec-visual-icon">'+(map[kind]||"◆")+'</span>';
}
function execCompanyVisual(name){
  if(!name)return "";
  if(typeof cpCompanyLogo==="function")return cpCompanyLogo(name);
  if(typeof companyLogo==="function")return companyLogo(name);
  return '<span class="company-fallback">'+esc(String(name).slice(0,2).toUpperCase())+'</span>';
}
function execAttentionCards(){
  const items=execUrgentSignals(),allNews=execNews();
  return '<div class="daily-attention-grid">'+items.map(x=>{
    const matched=x.kind==="Competitive signal"?allNews.find(n=>n.title===x.title):null;
    return '<article><div class="daily-attention-top"><div class="attention-kind">'+execVisualIcon(x.kind)+(matched?execCompanyVisual(matched.company):"")+'<span>'+esc(x.kind)+'</span></div>'+execStatusBadge(x.priority)+'</div><h3>'+esc(x.title)+'</h3><p>'+esc(x.detail)+'</p><div class="daily-attention-foot"><small>'+esc(x.date)+'</small>'+(x.url?'<a href="'+x.url+'" target="_blank" rel="noopener">Open source ↗</a>':x.route?'<button onclick="navigate(\''+x.route+'\')">Open section →</button>':'')+'</div><div class="daily-action"><b>Suggested action</b><span>'+esc(x.action)+'</span></div></article>';
  }).join('')+'</div>';
}
function execPmrActions(){
  const rows=execCurrentPmrProjects(),d=execPmr();
  if(!rows.length)return '<div class="ci-empty">No active PMR projects in the synthetic portfolio.</div>';
  return '<div class="exec-pmr-actions">'+rows.map(p=>'<article><div class="exec-pmr-progress"><span>'+esc(p.status)+'</span><b>'+p.progress+'%</b></div><h3>'+esc(p.name)+'</h3><p>'+esc(p.stage)+'</p><div class="pmr-progress"><i style="width:'+p.progress+'%"></i></div><div class="exec-pmr-next"><b>Next milestone</b><span>'+esc(p.nextMilestone)+'</span></div><div class="exec-pmr-next"><b>Abbott action</b><span>'+esc(p.status==="In field"?"Close priority quotas, review fieldwork quality and prepare interim themes for client discussion.":"Complete synthesis, validate outliers and prepare the executive readout with clear decisions required.")+'</span></div><button onclick="navigate(\'pmr\')">Open PMR tracker →</button></article>').join('')+'</div>';
}
function execTrendCards(){
  const st=typeof executiveStrategy==="function"?executiveStrategy():{},trends=(st.trends||[]).slice(0,4),drivers=(st.drivers||[]).slice(0,3);
  return '<div class="daily-trends">'+trends.map(x=>'<article><span>Trend</span><strong>'+esc(x.title)+'</strong><p>'+esc(x.text)+'</p><small>'+esc(x.importance||"Medium")+' priority</small></article>').join('')+drivers.map(x=>'<article><span>Market dynamic</span><strong>'+esc(x.title)+'</strong><p>'+esc(x.text)+'</p><small>'+esc(x.importance||"Medium")+' priority</small></article>').join('')+'</div>';
}
function execMacroTable(){
  const rows=execDaily().macro||[];
  return '<div class="table-scroll"><table class="data-table exec-macro-table"><thead><tr><th>Factor</th><th>Direction</th><th>Potential impact</th><th>Why it matters</th><th>Regions most exposed</th></tr></thead><tbody>'+
  rows.map(r=>'<tr><td><strong>'+esc(r.factor)+'</strong></td><td><span class="macro-direction '+r.direction.toLowerCase()+'">'+esc(r.direction)+'</span></td><td>'+execStatusBadge(r.impact)+'</td><td>'+esc(r.detail)+'</td><td>'+esc((r.regions||[]).join(" · "))+'</td></tr>').join('')+'</tbody></table></div>';
}
function execRegionalBuzz(){
  const ex=typeof executiveData==="function"?executiveData():null,regions=(ex?.regions||[]).slice().sort((a,b)=>b.index-a.index);
  return '<div class="exec-buzz-wrap"><div class="exec-buzz-tags">'+(execDaily().buzz||[]).map(x=>'<span>'+esc(x)+'</span>').join('')+'</div><div class="exec-region-pulse">'+regions.map((r,i)=>'<article><span>#'+(i+1)+'</span><div><strong>'+esc(r.name)+'</strong><b>Opportunity index '+r.index+'</b><p>'+esc(r.story)+'</p></div></article>').join('')+'</div></div>';
}
function execCustomerSignals(){
  const d=execPmr(),v=d?.v2||{},prefs=v.voc?.preferences||[],patterns=v.voc?.currentPatterns||[],quotes=d?.quotes||[];
  if(!d)return '<div class="ci-empty">PMR demo data is not available.</div>';
  return '<div class="exec-customer-grid"><article class="exec-customer-hero"><span>Cross-study customer takeaway</span><strong>'+esc(v.headline||"")+'</strong><p>'+esc((d.recommendations||[])[0]?.text||"")+'</p><button onclick="navigate(\'pmr\',\'voc\')">Open VOC analysis →</button></article>'+
    '<article><span>Preference pattern</span><strong>'+esc(prefs[0]?.persona||"Customer")+'</strong><p>First preference: <b>'+esc(prefs[0]?.first||"N/A")+'</b><br/>Primary friction: <b>'+esc(prefs[0]?.avoid||"N/A")+'</b></p></article>'+
    '<article><span>Cross-persona pattern</span><strong>'+esc(patterns[0]?.label||"Emerging pattern")+'</strong><p>'+esc(patterns[0]?.detail||"")+'</p></article>'+
    '<article><span>Voice of customer</span><blockquote>“'+esc(quotes[0]?.quote||"Customer evidence becomes more useful when it is linked to a clear action.")+'”</blockquote><p>'+esc(quotes[0]?.persona||"End user")+'</p></article></div>';
}
function execSignalFeed(){
  const rows=execNews().slice(0,8);
  return '<div class="exec-signal-feed">'+rows.map(n=>'<article><time>'+esc(n.date)+'</time><div class="exec-signal-body"><div class="exec-signal-company">'+execCompanyVisual(n.company)+'<strong>'+esc(n.company)+'</strong></div><div class="exec-signal-meta"><span>'+esc(n.theme||"Other")+'</span>'+execStatusBadge(execPriority(n))+'</div><strong>'+esc(n.title)+'</strong><p>'+esc(n.summary)+'</p><a href="'+n.url+'" target="_blank" rel="noopener">'+esc(n.source||"Source")+' ↗</a></div></article>').join('')+'</div>';
}
function executiveExampleQuestion(q){$('executiveChatInput').value=q;runExecutiveChatbot()}
function execAssistantSources(news){
  return news.slice(0,3).map(n=>'<a href="'+n.url+'" target="_blank" rel="noopener">'+esc(n.company)+' — '+esc(n.source||"source")+' ↗</a>').join('');
}
function runExecutiveChatbot(){
  const input=$('executiveChatInput'),box=$('executiveChatResponse');if(!input||!box)return;
  const q=input.value.trim();if(!q){showToast("Enter a business question first.");return}
  box.innerHTML='<div class="assistant-thinking"><span></span><span></span><span></span> Synthesizing public intelligence and PMR evidence…</div>';
  setTimeout(()=>{
    const news=execNews(),pmr=execPmr(),ex=typeof executiveData==="function"?executiveData():null,st=typeof executiveStrategy==="function"?executiveStrategy():{};
    const roleCfg=businessRoleConfig(); const low=(q+" "+executiveAssistantState.need+" "+roleCfg.focus).toLowerCase();
    const regionMacro=(execDaily().macro||[]).filter(m=>executiveAssistantState.region==="Global"||(m.regions||[]).includes("Global")||(m.regions||[]).includes(executiveAssistantState.region));
    let headline="Integrated executive answer",body=[],actions=[];
    if(/customer|voc|persona|need|pain|adoption|preference/.test(low)){
      headline="Customer and adoption perspective";
      body.push(pmr?.v2?.headline||"Customer evidence is available in the PMR workspace.");
      const pref=pmr?.v2?.voc?.preferences?.[0];if(pref)body.push(pref.persona+" prioritizes "+pref.first+" while "+pref.avoid.toLowerCase()+" is a key friction.");
      actions.push("Open the VOC page to compare the signal by persona, region and care setting.");
    }else if(/compet|news|launch|regulat|m&a|partner/.test(low)){
      headline="Competitive signal perspective";
      news.slice(0,3).forEach(n=>body.push(n.company+": "+n.title+" — "+n.summary));
      actions.push("Review whether any high-priority signal changes the current competitor response plan.");
    }else if(/pmr|project|fieldwork|survey|interview/.test(low)){
      headline="PMR project perspective";
      const active=execCurrentPmrProjects();active.forEach(p=>body.push(p.name+" is "+p.status.toLowerCase()+" at "+p.progress+"%; next milestone: "+p.nextMilestone+"."));
      actions.push("Resolve active project dependencies before the next executive readout.");
    }else if(/market|region|growth|opportun|size/.test(low)){
      headline="Market and regional perspective";
      const top=ex?.regions?.slice().sort((a,b)=>b.index-a.index)[0];
      if(top)body.push(top.name+" currently carries the highest illustrative opportunity index ("+top.index+"), with the dashboard narrative: "+top.story);
      if(ex?.overview)body.push(ex.overview);
      actions.push("Open Industry overview for detailed market growth, regional sizing and competitive structure.");
    }else if(/risk|macro|econom|reimburse|cost|budget/.test(low)){
      headline="Risk and macro perspective";
      (regionMacro.length?regionMacro:(execDaily().macro||[])).slice(0,3).forEach(m=>body.push(m.factor+" ("+m.direction+"): "+m.detail));
      actions.push("Confirm which macro factors should be added to the account or portfolio risk register.");
    }else{
      if(news[0])body.push("Latest public signal: "+news[0].company+" — "+news[0].title+".");
      if(pmr?.v2?.headline)body.push("Customer signal: "+pmr.v2.headline);
      if((st.trends||[])[0])body.push("Industry trend: "+st.trends[0].title+" — "+st.trends[0].text);
      actions.push("Use the source links below and the PMR workspace to validate the decision context for "+executiveAssistantState.team+".");
    }
    box.innerHTML='<div class="assistant-response-head"><span>'+esc(roleCfg.short)+'</span><span>'+esc(executiveAssistantState.need)+'</span><b>'+esc(executiveAssistantState.region)+'</b></div><h3>'+esc(headline)+'</h3><p class="assistant-role-context"><strong>Role lens:</strong> '+esc(roleCfg.focus)+'.</p>'+
      '<div class="assistant-answer">'+body.map(x=>'<p>'+esc(x)+'</p>').join('')+'</div>'+
      '<div class="assistant-actions"><strong>Recommended next action</strong>'+actions.map(x=>'<p>→ '+esc(x)+'</p>').join('')+'</div>'+
      '<div class="assistant-sources"><strong>Public-source evidence</strong>'+execAssistantSources(news)+'</div>'+
      '<div class="assistant-disclaimer">Prototype behavior: this static frontend synthesizes source-linked public intelligence already ingested into Abbott 360 with synthetic PMR findings. Live internet retrieval requires a secured backend search / AI connector.</div>';
  },650);
}
function renderExecutiveHub(){
  const d=execPmr(),news=execNews(),urgent=execUrgentSignals(),active=execCurrentPmrProjects(),macro=execDaily().macro||[];
  const roleCfg=businessRoleConfig(); executiveAssistantState.team=currentBusinessRole;
  const roleNeeds=execNeedOptions(); if(!roleNeeds.includes(executiveAssistantState.need))executiveAssistantState.need=roleNeeds[0];
  const roleLabels={
    "Executive Leadership Team":{attention:"Leadership attention",pmr:"Customer & research pulse",trends:"Industry trends & dynamics",customer:"Customer signals"},
    "Product & Portfolio Management Team":{attention:"Portfolio & product signals",pmr:"Customer evidence for portfolio decisions",trends:"Portfolio-shaping trends",customer:"Unmet needs & preference signals"},
    "Marketing, Branding & Commercial Excellence Team":{attention:"Commercial attention",pmr:"Customer & commercial research pulse",trends:"Market, brand & channel dynamics",customer:"Customer & segment signals"},
    "Strategy & Business Development Team":{attention:"Strategic signals & opportunities",pmr:"Research informing growth choices",trends:"Market attractiveness & strategic dynamics",customer:"Customer evidence for growth strategy"},
    "Medical & Clinical Affairs, R&D & Innovation Team":{attention:"Clinical & innovation signals",pmr:"Evidence & unmet-need research pulse",trends:"Technology & clinical dynamics",customer:"Clinical workflow & unmet-need signals"}
  }[currentBusinessRole]||{};
  $('breadcrumbSmall').textContent='Abbott 360 / '+roleCfg.short;$('breadcrumbTitle').textContent=currentDomain+' — '+roleCfg.assistant;
  const questions=execDaily().questions||[];
  const rolePrompts={
    "Executive Leadership Team":["What decisions require leadership attention this week?","Where are the biggest growth and risk signals?","Which competitive moves could materially change our outlook?"],
    "Product & Portfolio Management Team":["Where are the strongest portfolio gaps and whitespace opportunities?","Which product features are competitors using to differentiate?","What unmet customer needs should shape our roadmap?"],
    "Marketing, Branding & Commercial Excellence Team":["How should we adjust positioning based on current competitor moves?","What pricing, reimbursement or channel signals matter most?","Which customer segments show the strongest commercial opportunity?"],
    "Strategy & Business Development Team":["Which adjacencies, partnerships or M&A signals should we investigate?","Where is market attractiveness improving or deteriorating?","What competitor strategy shifts could create an opening?"],
    "Medical & Clinical Affairs, R&D & Innovation Team":["Which clinical evidence and unmet needs should influence innovation priorities?","What emerging technologies could change the standard workflow?","Where are evidence gaps creating differentiation opportunities?"]
  };
  const tailoredQuestions=rolePrompts[currentBusinessRole]||questions;
  $('pageContent').innerHTML=
    '<section class="hero daily-hero role-aware-hero"><div class="hero-grid"><div><div class="kicker" style="color:#8ee1f5">'+esc(roleCfg.short)+' · '+esc(currentDomain)+'</div><h1>'+esc(roleCfg.assistant)+'</h1><p>This workspace prioritizes '+esc(roleCfg.focus)+'. The evidence, modules and assistant responses below are tailored to your selected role.</p><div class="hero-tags"><span>'+esc(currentRole)+' access</span><span>Role-tailored intelligence</span><span>'+esc(currentDomain)+'</span></div></div>'+
    '<div class="daily-hero-metrics"><article><b>'+urgent.length+'</b><span>Priority signals</span></article><article><b>'+active.length+'</b><span>Active PMR projects</span></article><article><b>'+news.filter(n=>execPriority(n)==="High").length+'</b><span>High-priority public signals</span></article><article><b>'+macro.filter(x=>x.impact==="High").length+'</b><span>High-impact macro factors</span></article></div></div></section>'+
    '<section class="section executive-assistant-section exec-section-first"><div class="section-head visual-section-head"><div class="visual-title-wrap">'+execVisualIcon("assistant")+'<div><h2>'+esc(roleCfg.assistant)+'</h2><p>Ask a question within your '+esc(roleCfg.short)+' remit. Responses are framed around '+esc(roleCfg.focus)+'.</p></div></div><span class="assistant-evidence-badge">Public intelligence + PMR</span></div>'+
      '<div class="executive-assistant"><div class="assistant-config">'+
        '<label>Your role<div class="assistant-locked-role">'+esc(currentBusinessRole)+'</div></label>'+
        execSelect("What are you looking for?","need",execNeedOptions(),executiveAssistantState.need)+
        execSelect("Region responsible","region",["Global","North America","Europe","Asia-Pacific","Latin America","Middle East & Africa"],executiveAssistantState.region)+
      '</div><div class="assistant-question"><textarea id="executiveChatInput" placeholder="Ask a business question, e.g., What should we pay attention to in this domain over the next 90 days?"></textarea><button onclick="runExecutiveChatbot()">Analyze question →</button></div>'+
      '<div class="assistant-prompts">'+tailoredQuestions.map(q=>'<button onclick="executiveExampleQuestion(\''+q.replace(/'/g,"\\'")+'\')">'+esc(q)+'</button>').join('')+'</div>'+
      '<div id="executiveChatResponse" class="executive-chat-response"><div class="assistant-placeholder"><span>AI</span><div><strong>Ready for a role-specific question</strong><p>The prototype will synthesize source-linked competitive intelligence already in the platform with synthetic PMR findings and show the evidence used.</p></div></div></div></div></section>'+

    '<section class="section exec-section-first"><div class="section-head visual-section-head"><div class="visual-title-wrap">'+execVisualIcon("signal")+'<div><h2>'+esc(roleLabels.attention||"Immediate attention")+'</h2><p>Signals and project milestones most likely to require an executive decision, response or follow-up.</p></div></div><button class="daily-link-btn" onclick="navigate(\'industry\')">Open industry overview →</button></div>'+execAttentionCards()+'</section>'+
    '<section class="section"><div class="section-head visual-section-head"><div class="visual-title-wrap">'+execVisualIcon("pmr")+'<div><h2>'+esc(roleLabels.pmr||"PMR action center")+'</h2><p>Ongoing primary market research projects and the next actions expected from Abbott.</p></div></div><button class="daily-link-btn" onclick="navigate(\'pmr\')">Open PMR portfolio →</button></div>'+execPmrActions()+'</section>'+
    '<section class="section"><div class="grid-2"><div class="card"><div class="card-title"><h3>'+esc(roleLabels.trends||"Industry trends & dynamics")+'</h3><small>Priority themes shaping the domain</small></div>'+execTrendCards()+'</div><div class="card"><div class="card-title"><h3>Global & regional buzz</h3><small>Current themes and opportunity hotspots</small></div>'+execRegionalBuzz()+'</div></div></section>'+
    '<section class="section"><div class="section-head visual-section-head"><div class="visual-title-wrap">'+execVisualIcon("macro")+'<div><h2>Macroeconomic & external-factor watch</h2><p>Directional factors that could change demand, investment, access, pricing or customer behavior.</p></div></div></div><div class="card">'+execMacroTable()+'</div></section>'+
    '<section class="section"><div class="section-head visual-section-head"><div class="visual-title-wrap">'+execVisualIcon("customer")+'<div><h2>'+esc(roleLabels.customer||"Customer signals")+'</h2><p>High-level customer evidence synthesized from the assumed VOC, expert and survey research portfolio.</p></div></div></div>'+execCustomerSignals()+'</section>'+
    '<section class="section"><div class="section-head visual-section-head"><div class="visual-title-wrap">'+execVisualIcon("signal")+'<div><h2>Key public signals</h2><p>Recent company, regulatory, product, clinical and organizational developments already captured in Abbott 360.</p></div></div><button class="daily-link-btn" onclick="navigate(\'ci\',\'news-alerts\')">Open News & Alerts →</button></div><div class="card">'+execSignalFeed()+'</div></section>';
}