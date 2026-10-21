/* Dedicated Primary Market Research dashboards — synthetic demo research */
let pmrIntelState={
  domain:null,
  voc:{project:"All qualitative projects",persona:"All personas",region:"All regions",setting:"All settings",theme:"All themes"},
  "expert-interviews":{project:"All interview projects",expert:"All expert types",region:"All regions",theme:"All themes",consensus:"All consensus levels"},
  "quant-surveys":{project:"",persona:"All personas",region:"All regions",setting:"All settings",outcome:"Overall experience"}
};

function pmrData(){return window.PMR_DEMO_DATA?.[currentDomain]}
function pmrCfg(){return pmrData()?.config||{}}
function pmrUnique(arr){return [...new Set((arr||[]).filter(Boolean))].sort((a,b)=>String(a).localeCompare(String(b)))}
function pmrEnsureState(id){
  const d=pmrData();if(!d)return;
  if(pmrIntelState.domain!==currentDomain){
    pmrIntelState.domain=currentDomain;
    pmrIntelState.voc={project:"All qualitative projects",persona:"All personas",region:"All regions",setting:"All settings",theme:"All themes"};
    pmrIntelState["expert-interviews"]={project:"All interview projects",expert:"All expert types",region:"All regions",theme:"All themes",consensus:"All consensus levels"};
    const qp=d.projects.filter(p=>p.type.includes("Quantitative"));
    pmrIntelState["quant-surveys"]={project:qp[0]?.id||"",persona:"All personas",region:"All regions",setting:"All settings",outcome:"Overall experience"};
  }
}
function updatePMRFilter(module,key,value){pmrIntelState[module][key]=value;renderPMRIntelligence(module)}
function pmrSelect(label,key,values,value,module){
  return '<label>'+esc(label)+'<select onchange="updatePMRFilter(\''+module+'\',\''+key+'\',this.value)">'+values.map(v=>'<option value="'+esc(v.value??v)+'" '+((v.value??v)===value?'selected':'')+'>'+esc(v.label??v)+'</option>').join('')+'</select></label>';
}
function pmrPageHead(title,desc){
  const t=String(title).toLowerCase(),icon=t.includes("voice")?"◉":t.includes("expert")?"✦":"▥";
  return '<div class="page-head pmr-page-head"><div class="pmr-page-icon">'+icon+'</div><div class="title-wrap"><div class="breadcrumb"><button onclick="navigate(\'executive\')">Executive Hub</button> / <button onclick="openSegment(\'pmr\')">Primary Market Research</button> / '+esc(title)+'</div><h1>'+esc(title)+'</h1><p>'+desc+'</p></div><span class="pmr-demo-badge">Synthetic PMR demo data</span></div>';
}
function pmrResearchPortfolio(){
  const d=pmrData();
  return '<div class="pmr-project-strip">'+d.projects.map(p=>'<article><span>'+esc(p.period)+'</span><strong>'+esc(p.name)+'</strong><p>'+esc(p.type)+' · n='+p.sample+'</p><small>'+esc(p.purpose)+'</small></article>').join('')+'</div>';
}
function pmrFilterText(s){return Object.entries(s).filter(([k,v])=>v!==""&&!String(v).toLowerCase().startsWith("all ")).map(([k,v])=>String(v)).join("|")}
function pmrFilteredBase(base,state){
  let factor=1;
  if(state.persona&&state.persona!=="All personas")factor*=.24;
  if(state.expert&&state.expert!=="All expert types")factor*=.24;
  if(state.region&&state.region!=="All regions")factor*=.34;
  if(state.setting&&state.setting!=="All settings")factor*=.46;
  return Math.max(3,Math.round(base*factor));
}
function pmrAdj(base,label,state,spread=10){
  const f=pmrFilterText(state),delta=f?(pmrHash(currentDomain+"|"+label+"|"+f)%(spread*2+1)-spread):0;
  return pmrClamp(base+delta);
}
function pmrThemeRows(state){
  const d=pmrData();
  let rows=d.themes.map(x=>({...x,
    frequency:pmrAdj(x.frequency,x.theme+"f",state,8),
    importance:pmrAdj(x.importance,x.theme+"i",state,7),
    satisfaction:pmrAdj(x.satisfaction,x.theme+"s",state,8),
    severity:pmrAdj(x.severity,x.theme+"v",state,7),
    consensus:pmrAdj(x.consensus,x.theme+"c",state,8),
    momentum:pmrAdj(x.momentum,x.theme+"m",state,9)
  }));
  if(state.theme&&state.theme!=="All themes")rows=rows.filter(x=>x.theme===state.theme);
  return rows;
}
function pmrPersonaRows(state){
  const d=pmrData();let rows=d.personaMetrics.map(x=>({...x,
    interviews:Math.max(3,x.interviews+(pmrHash(x.persona+pmrFilterText(state))%5)-2),
    satisfaction:pmrAdj(x.satisfaction,x.persona+"sat",state,8),
    unmet:pmrAdj(x.unmet,x.persona+"unmet",state,8),
    adoption:pmrAdj(x.adoption,x.persona+"adopt",state,8),
    digitalReadiness:pmrAdj(x.digitalReadiness,x.persona+"dig",state,8)
  }));
  if(state.persona&&state.persona!=="All personas")rows=rows.filter(x=>x.persona===state.persona);
  return rows;
}
function pmrKpis(items){
  return '<div class="pmr-kpis">'+items.map(x=>'<article><span>'+esc(x.label)+'</span><strong>'+esc(String(x.value))+'</strong><small>'+esc(x.note||"")+'</small></article>').join('')+'</div>';
}
function pmrHorizontalBars(rows,max=100){
  if(!rows.length)return '<div class="ci-empty">No data under the current selection.</div>';
  return '<div class="ci-bars">'+rows.map(r=>'<div class="ci-bar-row"><span>'+esc(r.label)+'</span><div><i style="width:'+Math.max(2,Math.min(100,r.value/max*100))+'%"></i></div><b>'+esc(r.display??Math.round(r.value))+'</b></div>').join('')+'</div>';
}
function pmrScatter(rows,xKey,yKey,xLabel,yLabel){
  if(!rows.length)return '<div class="ci-empty">No data for this view.</div>';
  const W=650,H=360,p=52;
  return '<div class="pmr-scatter"><svg viewBox="0 0 '+W+' '+H+'">'+
    '<line x1="'+p+'" y1="'+(H-p)+'" x2="'+(W-p)+'" y2="'+(H-p)+'" stroke="#c4cdd1"/><line x1="'+p+'" y1="'+p+'" x2="'+p+'" y2="'+(H-p)+'" stroke="#c4cdd1"/>'+
    '<line x1="'+(W/2)+'" y1="'+p+'" x2="'+(W/2)+'" y2="'+(H-p)+'" stroke="#e1e7ea" stroke-dasharray="5 5"/><line x1="'+p+'" y1="'+(H/2)+'" x2="'+(W-p)+'" y2="'+(H/2)+'" stroke="#e1e7ea" stroke-dasharray="5 5"/>'+
    rows.map((r,i)=>{const x=p+(Number(r[xKey])-30)/70*(W-2*p),y=H-p-(Number(r[yKey])-30)/70*(H-2*p);return '<g><circle cx="'+x+'" cy="'+y+'" r="11" fill="#0076a8" fill-opacity=".16" stroke="#0076a8" stroke-width="2"/><circle cx="'+x+'" cy="'+y+'" r="4" fill="#0076a8"/><text x="'+x+'" y="'+(y-15)+'" text-anchor="middle" font-size="10" font-weight="800" fill="#003b5c">'+esc(r.theme||r.label||("T"+(i+1)))+'</text></g>'}).join('')+
    '<text x="'+(W/2)+'" y="'+(H-10)+'" text-anchor="middle" font-size="11" fill="#6b7478">'+esc(xLabel)+' →</text><text x="16" y="'+(H/2)+'" transform="rotate(-90 16 '+(H/2)+')" text-anchor="middle" font-size="11" fill="#6b7478">'+esc(yLabel)+' →</text>'+
    '</svg></div>';
}
function pmrThemeHeatmap(personas,themes,state,mode){
  return ci2Heatmap(personas,themes,(persona,theme)=>{
    const base=mode==="severity"?55:mode==="adoption"?52:60;
    return 1+Math.floor(pmrAdj(base,persona+"|"+theme+"|"+mode,state,30)/20);
  },"1 = lower intensity; 5 = higher intensity. Synthetic respondent-level aggregation for prototype.");
}
function pmrJourneyStages(){
  const map={
    "Autoimmunity & Allergy":["Symptoms / trigger","Primary evaluation","Specialist referral","Testing","Interpretation","Treatment / monitoring"],
    "Diabetes & Blood Glucose Monitoring":["Diagnosis / eligibility","Device selection","Onboarding","Daily use","Data review","Therapy adjustment"],
    "Ophthalmology & Eye Health":["Symptoms / screening","Diagnostic workup","Treatment decision","Procedure / device use","Post-op review","Longitudinal monitoring"],
    "Orthopedics & Sports Medicine":["Injury / diagnosis","Conservative care","Surgical decision","Procedure","Rehabilitation","Return to activity"],
    "Advanced Wound Management":["Wound assessment","Product selection","Application","Home / between-visit care","Progress review","Escalation / healing"],
    "Clinical Laboratory Services":["Order / request","Collection","Accessioning","Testing","Result / interpretation","Clinical follow-up"]
  };return map[currentDomain]||["Need","Evaluate","Select","Use","Review","Follow-up"];
}
function pmrJourneyChart(state){
  const stages=pmrJourneyStages();
  return '<div class="pmr-journey">'+stages.map((x,i)=>{const score=pmrAdj(48+(pmrHash(currentDomain+x)%45),x,state,8);return '<article><span>0'+(i+1)+'</span><strong>'+esc(x)+'</strong><div><i style="width:'+score+'%"></i></div><small>'+score+' friction index</small></article>'}).join('')+'</div>';
}
function pmrQuotes(state){
  const d=pmrData(),cfg=d.config;
  let rows=d.quotes.filter(q=>{
    if(state.persona&&state.persona!=="All personas"&&q.persona!==state.persona)return false;
    if(state.region&&state.region!=="All regions"&&q.region!==state.region)return false;
    if(state.setting&&state.setting!=="All settings"&&q.setting!==state.setting)return false;
    if(state.theme&&state.theme!=="All themes"&&q.theme!==state.theme)return false;
    return true;
  });
  if(!rows.length){
    const personas=state.persona&&state.persona!=="All personas"?[state.persona]:cfg.personas.slice(0,4);
    rows=personas.map((p,i)=>({persona:p,theme:state.theme!=="All themes"?state.theme:cfg.themes[i%cfg.themes.length],region:state.region!=="All regions"?state.region:cfg.regions[i%cfg.regions.length],setting:state.setting!=="All settings"?state.setting:cfg.settings[i%cfg.settings.length],salience:i<2?"High":"Medium",quote:"For this demo segment, "+(state.theme!=="All themes"?state.theme.toLowerCase():"workflow fit")+" is most valuable when it reduces uncertainty and makes the next action clearer."}));
  }
  return '<div class="pmr-quotes">'+rows.slice(0,6).map(q=>'<article><div><span>'+esc(q.persona)+'</span><em>'+esc(q.salience)+' salience</em></div><blockquote>“'+esc(q.quote)+'”</blockquote><p>'+esc(q.theme)+' · '+esc(q.setting)+' · '+esc(q.region)+'</p></article>').join('')+'</div>';
}
function pmrRecommendationGrid(){
  return '<div class="pmr-rec-grid">'+pmrData().recommendations.map((r,i)=>'<article><div><span>'+esc(r.priority)+'</span><em>'+esc(r.horizon)+'</em></div><strong>Priority '+(i+1)+'</strong><p>'+esc(r.text)+'</p><div class="pmr-rec-scores"><b>Evidence '+r.evidence+'</b><b>Feasibility '+r.feasibility+'</b></div></article>').join('')+'</div>';
}
function pmrMethodsFooter(){
  return '<section class="section"><div class="grid-2"><div class="card"><div class="card-title"><h3>Prototype research design basis</h3><small>Public methodology context</small></div><div class="source-list">'+(window.PMR_METHOD_SOURCES||[]).map(s=>'<div class="source-item"><a href="'+s.url+'" target="_blank" rel="noopener">'+esc(s.label)+' ↗</a></div>').join('')+'</div></div><div class="card"><div class="card-title"><h3>Evidence governance</h3><small>Demo-specific</small></div><div class="deliverable-list"><div class="deliverable-item"><div class="qnum">1</div><span>All PMR values, respondent counts beyond project design, quotes and statistical outputs shown here are synthetic prototype data.</span></div><div class="deliverable-item"><div class="qnum">2</div><span>Production versions should preserve respondent ID, project, wave, persona, market, setting, transcript / survey source and analysis method.</span></div><div class="deliverable-item"><div class="qnum">3</div><span>Qualitative frequency is directional and should not be interpreted as population prevalence; quantitative significance requires the actual sample design and weighting plan.</span></div></div></div></div></section>';
}

/* ---------------- Voice of Customer ---------------- */
function renderVOCPage(){
  const d=pmrData(),cfg=d.config,s=pmrIntelState.voc;
  const qual=d.projects.filter(p=>["In-depth interviews","Patient / caregiver interviews","Workflow observation + IDI"].includes(p.type));
  const projectOptions=[{value:"All qualitative projects",label:"All qualitative projects"},...qual.map(p=>({value:p.id,label:p.name}))];
  const themes=pmrThemeRows(s),personas=pmrPersonaRows(s);
  const totalInterviews=pmrFilteredBase(s.project==="All qualitative projects"?qual.reduce((a,p)=>a+p.sample,0):(qual.find(p=>p.id===s.project)?.sample||0),s);
  const selectedProject=qual.find(p=>p.id===s.project);
  const topTheme=themes.slice().sort((a,b)=>b.severity-a.severity)[0];
  const largestGap=themes.slice().sort((a,b)=>(b.importance-b.satisfaction)-(a.importance-a.satisfaction))[0];
  $('breadcrumbSmall').textContent='Primary Market Research / Voice of Customer Study';$('breadcrumbTitle').textContent=currentDomain+' — Voice of Customer';
  $('pageContent').innerHTML=pmrPageHead("Voice of Customer Study",'Interview-based voice-of-customer analysis for <b>'+esc(currentDomain)+'</b>, integrating end-user needs, workflow burden, experience, decision drivers, moments of truth and representative verbatim evidence across diverse stakeholder groups.')+
    '<section class="pmr-filter-shell five">'+
      pmrSelect("Project","project",projectOptions,s.project,"voc")+
      pmrSelect("Persona","persona",["All personas",...cfg.personas],s.persona,"voc")+
      pmrSelect("Region","region",["All regions",...cfg.regions],s.region,"voc")+
      pmrSelect("Care setting","setting",["All settings",...cfg.settings],s.setting,"voc")+
      pmrSelect("Theme","theme",["All themes",...cfg.themes],s.theme,"voc")+
    '</section>'+
    '<section class="section">'+pmrKpis([
      {label:"Interview base",value:totalInterviews,note:selectedProject?.method||"3 qualitative studies"},
      {label:"Personas represented",value:personas.length,note:s.persona},
      {label:"Markets",value:s.region==="All regions"?cfg.regions.length:1,note:s.region},
      {label:"Highest-friction theme",value:topTheme?.theme||"N/A",note:(topTheme?.severity||0)+" severity index"},
      {label:"Largest unmet gap",value:largestGap?.theme||"N/A",note:largestGap?((largestGap.importance-largestGap.satisfaction)+"-pt importance gap"):""},
      {label:"Research quality",value:d.fieldwork.qualityPass+"%",note:"Synthetic QC pass rate"}
    ])+'</section>'+
    '<section class="section"><div class="section-head"><div><h2>PMR program portfolio</h2><p>Seven diverse primary-research projects are assumed for this domain; this page analyzes the end-user qualitative studies.</p></div><span class="pmr-demo-badge small">7 demo projects</span></div>'+pmrResearchPortfolio()+'</section>'+
    '<section class="section"><div class="grid-2"><div class="card"><div class="card-title"><h3>Need-state opportunity matrix</h3><small>Importance vs current satisfaction</small></div>'+pmrScatter(themes,"satisfaction","importance","Current satisfaction","Importance")+'<p class="ci-chart-note">Upper-left themes combine high importance with lower satisfaction and represent the strongest improvement opportunities.</p></div><div class="card"><div class="card-title"><h3>Theme frequency & severity</h3><small>Interview-coded signals</small></div>'+pmrHorizontalBars(themes.map(x=>({label:x.theme,value:x.severity,display:x.severity})).sort((a,b)=>b.value-a.value),100)+'</div></div></section>'+
    '<section class="section"><div class="grid-3"><div class="card"><div class="card-title"><h3>Persona interview mix</h3><small>Selected lens</small></div>'+ciDonut(personas.map(x=>({label:x.persona,value:x.interviews})))+'</div><div class="card"><div class="card-title"><h3>Unmet-need intensity</h3><small>By persona</small></div>'+pmrHorizontalBars(personas.map(x=>({label:x.persona,value:x.unmet})).sort((a,b)=>b.value-a.value),100)+'</div><div class="card"><div class="card-title"><h3>Adoption readiness</h3><small>By persona</small></div>'+pmrHorizontalBars(personas.map(x=>({label:x.persona,value:x.adoption})).sort((a,b)=>b.value-a.value),100)+'</div></div></section>'+
    '<section class="section"><div class="section-head"><div><h2>Persona × need-state heatmap</h2><p>Shows where pain-point intensity differs by stakeholder under the active filters.</p></div></div><div class="card">'+pmrThemeHeatmap(personas.map(x=>x.persona),themes.map(x=>x.theme),s,"severity")+'</div></section>'+
    '<section class="section"><div class="grid-2"><div class="card"><div class="card-title"><h3>End-to-end journey friction</h3><small>'+esc(currentDomain)+'</small></div>'+pmrJourneyChart(s)+'</div><div class="card"><div class="card-title"><h3>Decision drivers</h3><small>Why users choose / continue a solution</small></div>'+pmrHorizontalBars(cfg.drivers.map(x=>({label:x,value:pmrAdj(62+(pmrHash(currentDomain+x)%32),x,s,8)})).sort((a,b)=>b.value-a.value),100)+'</div></div></section>'+
    '<section class="section"><div class="section-head"><div><h2>Representative interview evidence</h2><p>Synthetic verbatims illustrate how an evidence bank can be filtered by persona, setting, geography and theme.</p></div><span class="pmr-demo-badge small">Synthetic verbatim</span></div>'+pmrQuotes(s)+'</section>'+
    '<section class="section"><div class="section-head"><div><h2>Action priorities</h2><p>Cross-functional recommendations synthesized from the demo VOC evidence.</p></div></div>'+pmrRecommendationGrid()+'</section>'+
    pmrMethodsFooter();
}

/* ---------------- Expert & KOL Interview Analysis ---------------- */
function pmrExpertProjects(){
  return pmrData().projects.filter(p=>!p.type.includes("Quantitative"));
}
function pmrExpertThemeRows(state){
  return pmrThemeRows(state).map(x=>({...x,impact:pmrClamp((x.importance+x.momentum)/2),confidence:pmrClamp((x.consensus+x.frequency)/2)}));
}
function pmrExpertQuote(expert,theme,i){
  const stems=[
    "The next inflection point will depend on whether the evidence is strong enough to change routine practice.",
    "Adoption will accelerate when the workflow burden falls below the perceived clinical value.",
    "The market is moving from isolated product features toward integrated pathways and service models.",
    "The biggest gap is not awareness; it is confidence in how to implement the new approach consistently."
  ];
  return {expert,theme,quote:stems[(pmrHash(currentDomain+expert+theme+i)%stems.length)]};
}
function renderExpertPage(){
  const d=pmrData(),cfg=d.config,s=pmrIntelState["expert-interviews"],projects=pmrExpertProjects();
  const projectOptions=[{value:"All interview projects",label:"All interview projects"},...projects.map(p=>({value:p.id,label:p.name}))];
  let themes=pmrExpertThemeRows(s);
  if(s.consensus==="High consensus")themes=themes.filter(x=>x.consensus>=80);
  if(s.consensus==="Mixed")themes=themes.filter(x=>x.consensus>=60&&x.consensus<80);
  if(s.consensus==="Divergent")themes=themes.filter(x=>x.consensus<60);
  const experts=s.expert==="All expert types"?d.expertMetrics:d.expertMetrics.filter(x=>x.persona===s.expert);
  const selectedProject=projects.find(p=>p.id===s.project);
  const interviewBase=pmrFilteredBase(s.project==="All interview projects"?projects.reduce((a,p)=>a+p.sample,0):(selectedProject?.sample||0),s);
  const highConsensus=themes.filter(x=>x.consensus>=80).length,divergent=themes.filter(x=>x.consensus<65).length;
  $('breadcrumbSmall').textContent='Primary Market Research / Expert & KOL Interview Analysis';$('breadcrumbTitle').textContent=currentDomain+' — Expert & KOL Analysis';
  $('pageContent').innerHTML=pmrPageHead("Expert & KOL Interview Analysis",'Cross-project qualitative synthesis for <b>'+esc(currentDomain)+'</b>, combining expert transcripts, final reports and project outputs into themes, consensus, divergence, evidence strength, future-state signals and strategic recommendations.')+
    '<section class="pmr-filter-shell five">'+
      pmrSelect("Project","project",projectOptions,s.project,"expert-interviews")+
      pmrSelect("Expert type","expert",["All expert types",...cfg.expertTypes],s.expert,"expert-interviews")+
      pmrSelect("Region","region",["All regions",...cfg.regions],s.region,"expert-interviews")+
      pmrSelect("Theme","theme",["All themes",...cfg.themes],s.theme,"expert-interviews")+
      pmrSelect("Consensus","consensus",["All consensus levels","High consensus","Mixed","Divergent"],s.consensus,"expert-interviews")+
    '</section>'+
    '<section class="section">'+pmrKpis([
      {label:"Interview evidence base",value:interviewBase,note:selectedProject?.method||"4 interview-led studies"},
      {label:"Expert archetypes",value:experts.length,note:s.expert},
      {label:"Themes in view",value:themes.length,note:s.theme},
      {label:"High-consensus themes",value:highConsensus,note:"Consensus index ≥80"},
      {label:"Divergent themes",value:divergent,note:"Consensus index <65"},
      {label:"Cross-project recommendations",value:d.recommendations.length,note:"Action roadmap"}
    ])+'</section>'+
    '<section class="section"><div class="section-head"><div><h2>Cross-project evidence portfolio</h2><p>Qualitative projects feed a common taxonomy so themes can be compared across end users, KOLs and workflow studies.</p></div></div>'+pmrResearchPortfolio()+'</section>'+
    '<section class="section"><div class="grid-2"><div class="card"><div class="card-title"><h3>Theme salience vs expert consensus</h3><small>Prioritize high-impact, high-consensus signals</small></div>'+pmrScatter(themes,"consensus","impact","Expert consensus","Strategic impact")+'</div><div class="card"><div class="card-title"><h3>Theme momentum</h3><small>How strongly the issue is moving in current interviews</small></div>'+pmrHorizontalBars(themes.map(x=>({label:x.theme,value:x.momentum})).sort((a,b)=>b.value-a.value),100)+'</div></div></section>'+
    '<section class="section"><div class="grid-3"><div class="card"><div class="card-title"><h3>Expert mix</h3><small>Interview distribution</small></div>'+ciDonut(experts.map(x=>({label:x.persona,value:x.interviews})))+'</div><div class="card"><div class="card-title"><h3>Innovation outlook</h3><small>By expert archetype</small></div>'+pmrHorizontalBars(experts.map(x=>({label:x.persona,value:pmrAdj(x.innovation,x.persona+"innovation",s,7)})).sort((a,b)=>b.value-a.value),100)+'</div><div class="card"><div class="card-title"><h3>Evidence threshold</h3><small>Strength expected before adoption</small></div>'+pmrHorizontalBars(experts.map(x=>({label:x.persona,value:pmrAdj(x.evidence,x.persona+"evidence",s,7)})).sort((a,b)=>b.value-a.value),100)+'</div></div></section>'+
    '<section class="section"><div class="section-head"><div><h2>Expert × theme perspective matrix</h2><p>Directional intensity shows which topics are most salient to each expert archetype.</p></div></div><div class="card">'+pmrThemeHeatmap(experts.map(x=>x.persona),themes.map(x=>x.theme),s,"adoption")+'</div></section>'+
    '<section class="section"><div class="grid-2"><div class="card"><div class="card-title"><h3>Cross-project theme recurrence</h3><small>Number of qualitative studies surfacing each theme</small></div>'+pmrHorizontalBars(themes.map(x=>({label:x.theme,value:1+(pmrHash(currentDomain+x.theme+"projects")%projects.length),display:(1+(pmrHash(currentDomain+x.theme+"projects")%projects.length))+" / "+projects.length})),projects.length)+'</div><div class="card"><div class="card-title"><h3>Project-level synthesis</h3><small>What each study contributes</small></div><div class="pmr-project-table">'+projects.map(p=>'<article><span>'+esc(p.period)+'</span><div><strong>'+esc(p.name)+'</strong><p>'+esc(p.purpose)+'</p></div><b>n='+p.sample+'</b></article>').join('')+'</div></div></div></section>'+
    '<section class="section"><div class="section-head"><div><h2>Representative KOL evidence</h2><p>Synthetic quotes demonstrate transcript-level evidence retrieval under the selected theme and expert filters.</p></div><span class="pmr-demo-badge small">Synthetic verbatim</span></div><div class="pmr-quotes">'+experts.slice(0,4).map((e,i)=>{const t=themes[i%Math.max(themes.length,1)]?.theme||cfg.themes[i%cfg.themes.length],q=pmrExpertQuote(e.persona,t,i);return '<article><div><span>'+esc(q.expert)+'</span><em>'+esc(t)+'</em></div><blockquote>“'+esc(q.quote)+'”</blockquote><p>'+esc(s.region==="All regions"?cfg.regions[i%cfg.regions.length]:s.region)+' · Expert interview</p></article>'}).join('')+'</div></section>'+
    '<section class="section"><div class="section-head"><div><h2>Strategic recommendation roadmap</h2><p>Recommendations are prioritized using synthetic evidence-strength and feasibility indices.</p></div></div>'+pmrRecommendationGrid()+'</section>'+
    pmrMethodsFooter();
}

/* ---------------- Quantitative Survey Analysis ---------------- */
function pmrQuantProjects(){return pmrData().projects.filter(p=>p.type.includes("Quantitative"))}
function pmrSurveyRows(state){
  return pmrData().surveyQuestions.map(q=>({...q,
    mean:+Math.max(1,Math.min(5,q.mean+(pmrHash(q.id+pmrFilterText(state))%7-3)/10)).toFixed(1),
    top2:pmrAdj(q.top2,q.label+"top2",state,8),
    importance:pmrAdj(q.importance,q.label+"imp",state,7),
    satisfaction:pmrAdj(q.satisfaction,q.label+"sat",state,8),
    driver:+Math.max(.05,Math.min(.65,q.driver+(pmrHash(q.id+"drv"+pmrFilterText(state))%9-4)/100)).toFixed(2)
  }));
}
function pmrSampleComposition(project,state){
  const cfg=pmrCfg(),n=pmrFilteredBase(project?.sample||0,state);
  const personas=state.persona==="All personas"?cfg.personas:[state.persona];
  let weights=personas.map(p=>10+(pmrHash(project.id+p)%25)),sum=weights.reduce((a,b)=>a+b,0)||1;
  return personas.map((p,i)=>({label:p,value:Math.round(n*weights[i]/sum)}));
}
function pmrRegionComposition(project,state){
  const cfg=pmrCfg(),regions=state.region==="All regions"?cfg.regions:[state.region],n=pmrFilteredBase(project?.sample||0,state);
  let weights=regions.map(r=>15+(pmrHash(project.id+r)%25)),sum=weights.reduce((a,b)=>a+b,0)||1;
  return regions.map((r,i)=>({label:r,value:Math.round(n*weights[i]/sum)}));
}
function pmrSegments(project,state){
  const labels=["Innovation Seekers","Evidence-led Pragmatists","Workflow Optimizers","Access-constrained Traditionalists"];
  let vals=labels.map(x=>15+(pmrHash(currentDomain+project.id+x+pmrFilterText(state))%25)),sum=vals.reduce((a,b)=>a+b,0);
  return labels.map((label,i)=>({label,value:Math.round(vals[i]/sum*100)}));
}
function pmrDriverTable(rows){
  const sorted=rows.slice().sort((a,b)=>b.driver-a.driver);
  return '<div class="table-scroll"><table class="data-table"><thead><tr><th>Potential driver</th><th>Standardized driver</th><th>Top-2-box</th><th>Importance</th><th>Significance</th><th>Interpretation</th></tr></thead><tbody>'+sorted.map((r,i)=>'<tr><td><strong>'+esc(r.label)+'</strong></td><td>'+r.driver.toFixed(2)+'</td><td>'+r.top2+'%</td><td>'+r.importance+'</td><td><span class="'+(r.sig==="ns"?"pmr-ns":"pmr-sig")+'">'+esc(r.sig)+'</span></td><td>'+esc(i<2?"High-priority driver; improvement is likely to have the strongest relationship with the selected outcome.":r.sig==="ns"?"Directional relationship; validate with the final weighted sample.":"Secondary but meaningful driver.")+'</td></tr>').join('')+'</tbody></table></div>';
}
function renderQuantPage(){
  const d=pmrData(),cfg=d.config,s=pmrIntelState["quant-surveys"],projects=pmrQuantProjects();
  if(!projects.some(p=>p.id===s.project))s.project=projects[0]?.id||"";
  const project=projects.find(p=>p.id===s.project)||projects[0],rows=pmrSurveyRows(s),personaComp=pmrSampleComposition(project,s),regionComp=pmrRegionComposition(project,s),segments=pmrSegments(project,s);
  const strongest=rows.slice().sort((a,b)=>b.driver-a.driver)[0],biggestGap=rows.slice().sort((a,b)=>(b.importance-b.satisfaction)-(a.importance-a.satisfaction))[0];
  const outcomes=["Overall experience","Adoption intent","Future preference","Digital readiness","Recommendation / advocacy"];
  $('breadcrumbSmall').textContent='Primary Market Research / Quantitative Survey Analysis';$('breadcrumbTitle').textContent=currentDomain+' — Quantitative Survey';
  $('pageContent').innerHTML=pmrPageHead("Quantitative Survey Analysis",'Advanced analysis of synthetic survey datasets for <b>'+esc(currentDomain)+'</b>, including dynamic cross-tabs, derived indices, driver analysis, significance flags, segmentation and importance-performance prioritization.')+
    '<section class="pmr-filter-shell five">'+
      pmrSelect("Survey project","project",projects.map(p=>({value:p.id,label:p.name})),s.project,"quant-surveys")+
      pmrSelect("Persona","persona",["All personas",...cfg.personas],s.persona,"quant-surveys")+
      pmrSelect("Region","region",["All regions",...cfg.regions],s.region,"quant-surveys")+
      pmrSelect("Care setting","setting",["All settings",...cfg.settings],s.setting,"quant-surveys")+
      pmrSelect("Outcome","outcome",outcomes,s.outcome,"quant-surveys")+
    '</section>'+
    '<section class="section">'+pmrKpis([
      {label:"Survey sample",value:"n="+pmrFilteredBase(project.sample,s),note:(pmrFilteredBase(project.sample,s)===project.sample?"Full sample":"Filtered analytical base")+" · "+project.method},
      {label:"Quality pass",value:d.fieldwork.qualityPass+"%",note:"Synthetic QC index"},
      {label:"Mean completion",value:(9+(pmrHash(project.id+"loi")%6))+" min",note:"Prototype estimate"},
      {label:"Strongest driver",value:strongest?.label||"N/A",note:"β "+(strongest?.driver||0).toFixed(2)},
      {label:"Largest unmet gap",value:biggestGap?.label||"N/A",note:biggestGap?((biggestGap.importance-biggestGap.satisfaction)+" pts"):""},
      {label:"Outcome modeled",value:s.outcome,note:"Dynamic analytical lens"}
    ])+'</section>'+
    '<section class="section"><div class="section-head"><div><h2>Survey portfolio</h2><p>Three complementary quantitative studies are assumed within a broader seven-project PMR program.</p></div><span class="pmr-demo-badge small">Synthetic survey data</span></div>'+pmrResearchPortfolio()+'</section>'+
    '<section class="section"><div class="grid-3"><div class="card"><div class="card-title"><h3>Sample by persona</h3><small>Current filtered base</small></div>'+ciDonut(personaComp)+'</div><div class="card"><div class="card-title"><h3>Sample by region</h3><small>Current filtered base</small></div>'+pmrHorizontalBars(regionComp,Math.max(...regionComp.map(x=>x.value),1))+'</div><div class="card"><div class="card-title"><h3>Derived respondent segments</h3><small>Illustrative cluster solution</small></div>'+ciDonut(segments)+'</div></div></section>'+
    '<section class="section"><div class="grid-2"><div class="card"><div class="card-title"><h3>Question / attribute topline</h3><small>Top-2-box %</small></div>'+pmrHorizontalBars(rows.map(r=>({label:r.label,value:r.top2,display:r.top2+"%"})).sort((a,b)=>b.value-a.value),100)+'</div><div class="card"><div class="card-title"><h3>Importance-performance matrix</h3><small>Priority improvement areas</small></div>'+pmrScatter(rows.map(r=>({...r,theme:r.label})),"satisfaction","importance","Current performance","Importance")+'</div></div></section>'+
    '<section class="section"><div class="section-head"><div><h2>Dynamic persona × attribute crosstab</h2><p>Illustrates analysis that becomes cumbersome in standard third-party survey charting tools when multiple filters and derived indices are applied.</p></div></div><div class="card">'+ci2Heatmap(s.persona==="All personas"?cfg.personas:[s.persona],rows.map(r=>r.label),(persona,theme)=>{const r=rows.find(x=>x.label===theme);return pmrAdj(r.top2,persona+theme,s,12)},"Cells show synthetic Top-2-box percentages for the active project / region / setting / outcome lens.")+'</div></section>'+
    '<section class="section"><div class="grid-2"><div class="card"><div class="card-title"><h3>Driver strength</h3><small>Standardized relationship with '+esc(s.outcome)+'</small></div>'+pmrHorizontalBars(rows.map(r=>({label:r.label,value:r.driver*100,display:r.driver.toFixed(2)})).sort((a,b)=>b.value-a.value),65)+'</div><div class="card"><div class="card-title"><h3>Mean-score profile</h3><small>1–5 scale</small></div>'+pmrHorizontalBars(rows.map(r=>({label:r.label,value:r.mean,display:r.mean.toFixed(1)})).sort((a,b)=>b.value-a.value),5)+'</div></div></section>'+
    '<section class="section"><div class="section-head"><div><h2>Driver model detail</h2><p>Shows how statistical outputs can be combined with significance and business interpretation.</p></div><span class="pmr-demo-badge small">Illustrative statistics</span></div><div class="card">'+pmrDriverTable(rows)+'</div></section>'+
    '<section class="section"><div class="grid-2"><div class="card"><div class="card-title"><h3>Segment profiles</h3><small>Illustrative behavioral clusters</small></div><div class="pmr-segments">'+segments.map((x,i)=>'<article><span>'+x.value+'%</span><div><strong>'+esc(x.label)+'</strong><p>'+esc(i===0?"High interest in innovation and digital integration; willing to trial with credible evidence.":i===1?"Requires strong comparative evidence and predictable workflow before changing current practice.":i===2?"Prioritizes efficiency, simplicity and operational fit over feature novelty.":"Access, affordability or organizational constraints slow adoption despite recognized value.")+'</p></div></article>').join('')+'</div></div><div class="card"><div class="card-title"><h3>Recommended analytical actions</h3><small>What to do next</small></div><div class="deliverable-list"><div class="deliverable-item"><div class="qnum">1</div><span>Validate the top two driver coefficients with weighted regression and multicollinearity diagnostics on the production dataset.</span></div><div class="deliverable-item"><div class="qnum">2</div><span>Investigate the largest importance-performance gaps by persona and setting before translating them into product requirements.</span></div><div class="deliverable-item"><div class="qnum">3</div><span>Profile the four derived segments against geography, current solution, experience and future adoption intent.</span></div><div class="deliverable-item"><div class="qnum">4</div><span>Use open-ended responses to explain statistically significant subgroup differences rather than treating quantitative deltas in isolation.</span></div></div></div></div></section>'+
    pmrMethodsFooter();
}

function renderPMRIntelligence(id){
  pmrEnsureState(id);
  if(id==="voc")return renderVOCPage();
  if(id==="expert-interviews")return renderExpertPage();
  if(id==="quant-surveys")return renderQuantPage();
}