/* PMR Intelligence v2 — richer project-realistic demo dashboards */
let pmrPortfolioState={status:"All statuses",method:"All methods",period:"All periods"};

function pmrV2(){return pmrData()?.v2||{}}
function pmrProjectLabel(p){return p.name+" · "+p.period}
function pmrOverviewFilter(label,key,values,value){
  return '<label>'+esc(label)+'<select onchange="updatePMRPortfolioFilter(\''+key+'\',this.value)">'+values.map(v=>'<option '+(v===value?'selected':'')+'>'+esc(v)+'</option>').join('')+'</select></label>';
}
function updatePMRPortfolioFilter(key,value){pmrPortfolioState[key]=value;renderSegmentOverview("pmr")}

function pmrFilteredProjects(){
  const rows=(pmrData()?.projects||[]);
  return rows.filter(p=>{
    if(pmrPortfolioState.status!=="All statuses"&&p.status!==pmrPortfolioState.status)return false;
    if(pmrPortfolioState.method!=="All methods"&&p.type!==pmrPortfolioState.method)return false;
    if(pmrPortfolioState.period!=="All periods"&&p.period!==pmrPortfolioState.period)return false;
    return true;
  });
}
function pmrPortfolioStatusDonut(rows){
  const sts=["Completed","In field","Analysis"].map(x=>({label:x,value:rows.filter(p=>p.status===x).length})).filter(x=>x.value);
  return ciDonut(sts);
}
function pmrProjectTrackerTable(rows){
  if(!rows.length)return '<div class="ci-empty">No PMR projects match the current tracker filters.</div>';
  return '<div class="table-scroll"><table class="data-table pmr-tracker-table"><thead><tr><th>Project</th><th>Status</th><th>Method</th><th>Sample</th><th>Markets</th><th>Timeline</th><th>Progress</th><th>Owner</th><th>Current stage</th><th>Next milestone</th></tr></thead><tbody>'+
    rows.map(p=>'<tr><td><strong>'+esc(p.name)+'</strong><small>'+esc(p.purpose)+'</small></td><td><span class="pmr-status '+p.status.toLowerCase().replaceAll(" ","-")+'">'+esc(p.status)+'</span></td><td>'+esc(p.type)+'</td><td>n='+p.sample+'</td><td>'+esc(p.markets.join(", "))+'</td><td>'+esc(p.start)+' → '+esc(p.end)+'</td><td><div class="pmr-progress"><i style="width:'+p.progress+'%"></i></div><small>'+p.progress+'%</small></td><td>'+esc(p.owner)+'</td><td>'+esc(p.stage)+'</td><td>'+esc(p.nextMilestone)+'</td></tr>').join('')+
    '</tbody></table></div>';
}
function renderPMRPortfolioOverview(){
  const d=pmrData();if(!d)return "";
  const all=d.projects,rows=pmrFilteredProjects(),methods=pmrUnique(all.map(p=>p.type)),periods=pmrUnique(all.map(p=>p.period));
  const totalN=all.reduce((a,p)=>a+p.sample,0),completed=all.filter(p=>p.status==="Completed").length,active=all.length-completed;
  return '<section class="section pmr-portfolio-overview"><div class="section-head"><div><h2>PMR project portfolio & tracker</h2><p>Detailed view of completed and active primary-research workstreams assumed for '+esc(currentDomain)+'.</p></div><span class="pmr-demo-badge small">Synthetic project portfolio</span></div>'+
    '<div class="pmr-tracker-filters">'+pmrOverviewFilter("Status","status",["All statuses","Completed","In field","Analysis"],pmrPortfolioState.status)+pmrOverviewFilter("Method","method",["All methods",...methods],pmrPortfolioState.method)+pmrOverviewFilter("Period","period",["All periods",...periods],pmrPortfolioState.period)+'</div>'+
    pmrKpis([
      {label:"PMR projects",value:all.length,note:"Across qualitative + quantitative"},
      {label:"Completed",value:completed,note:"Insights available in hub"},
      {label:"Active",value:active,note:"Fieldwork / analysis"},
      {label:"Total respondent base",value:"n="+totalN,note:"Synthetic across all studies"},
      {label:"Markets covered",value:d.config.regions.length,note:d.config.regions.join(" · ")},
      {label:"Latest milestone",value:"2026 Q3",note:"Active analysis / fieldwork"}
    ])+
    '<div class="grid-3 pmr-tracker-summary"><div class="card"><div class="card-title"><h3>Status mix</h3><small>All projects</small></div>'+pmrPortfolioStatusDonut(all)+'</div><div class="card"><div class="card-title"><h3>Method mix</h3><small>Study diversity</small></div>'+ciDonut(pmrUnique(all.map(p=>p.type)).map(t=>({label:t,value:all.filter(p=>p.type===t).length})))+'</div><div class="card"><div class="card-title"><h3>Portfolio progress</h3><small>Project completion %</small></div>'+pmrHorizontalBars(all.map(p=>({label:p.name,value:p.progress,display:p.progress+"%"})),100)+'</div></div>'+
    '<div class="card pmr-tracker-card"><div class="card-title"><h3>Detailed tracker</h3><small>'+rows.length+' projects shown</small></div>'+pmrProjectTrackerTable(rows)+'</div></section>';
}

function pmrSimpleMentionList(rows,titleField="label"){
  return '<div class="pmr-mention-list">'+rows.map(r=>'<article><div><strong>'+esc(r[titleField])+'</strong><p>'+esc(r.note||r.consequence||"")+'</p></div><span>'+r.mentions+'%</span></article>').join('')+'</div>';
}
function pmrPreferenceCards(rows){
  return '<div class="pmr-pref-grid">'+rows.map(r=>'<article><strong>'+esc(r.persona)+'</strong><div><span>1st preference</span><b>'+esc(r.first)+'</b></div><div><span>2nd preference</span><b>'+esc(r.second)+'</b></div><div><span>Primary friction</span><b>'+esc(r.avoid)+'</b></div><div><span>Evidence expected</span><b>'+esc(r.evidence)+'</b></div></article>').join('')+'</div>';
}
function pmrPatternCards(rows){
  return '<div class="pmr-pattern-grid">'+rows.map((r,i)=>'<article><span>0'+(i+1)+'</span><div><strong>'+esc(r.label)+'</strong><p>'+esc(r.detail)+'</p></div></article>').join('')+'</div>';
}
function pmrRiskTable(rows){
  return '<div class="table-scroll"><table class="data-table pmr-risk-table"><thead><tr><th>Risk / friction</th><th>Likelihood</th><th>Impact</th><th>Observed signal</th><th>Mitigation / next research action</th></tr></thead><tbody>'+
    rows.map(r=>'<tr><td><strong>'+esc(r.label)+'</strong></td><td><span class="pmr-risk-pill '+r.likelihood.toLowerCase()+'">'+esc(r.likelihood)+'</span></td><td><span class="pmr-risk-pill '+r.impact.toLowerCase()+'">'+esc(r.impact)+'</span></td><td>'+esc(r.signal)+'</td><td>'+esc(r.mitigation)+'</td></tr>').join('')+'</tbody></table></div>';
}
function pmrRoadmap(){
  return '<div class="pmr-roadmap">'+(pmrV2().roadmap||[]).map((r,i)=>'<article><div class="pmr-roadmap-dot">'+(i+1)+'</div><div><span>'+esc(r.phase)+' · '+esc(r.horizon)+'</span><strong>'+esc(r.title)+'</strong><ul>'+r.actions.map(a=>'<li>'+esc(a)+'</li>').join('')+'</ul></div></article>').join('')+'</div>';
}
function pmrExecutiveRecommendations(){
  return '<div class="pmr-exec-recs">'+pmrData().recommendations.map((r,i)=>'<article><div><span>'+esc(r.priority)+'</span><em>'+esc(r.horizon)+'</em></div><strong>'+esc(r.text)+'</strong><p>'+esc(i===0?"Immediate action: align the highest-priority unmet need with product, service and evidence owners.":i===1?"Near-term action: validate the recommendation with the most affected personas before scaling.":i===2?"Commercial action: translate the insight into a persona-specific value proposition and enablement plan.":i===3?"Implementation action: pilot in the settings showing the strongest readiness and manageable friction.":"Monitoring action: retain as a roadmap hypothesis and track in the next PMR wave.")+'</p></article>').join('')+'</div>';
}
function pmrReadinessFriction(rows){
  if(!rows.length)return '<div class="ci-empty">No personas under current filters.</div>';
  const W=760,H=430,L=68,R=28,T=58,B=62,plotW=W-L-R,plotH=H-T-B;
  const x=v=>L+(v/100)*plotW,y=v=>H-B-(v/100)*plotH;
  const ticks=[0,25,50,75,100];
  return '<div class="pmr-rf-wrap"><div class="pmr-rf-map"><svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Readiness by implementation friction">'+
    '<rect x="'+L+'" y="'+T+'" width="'+(plotW/2)+'" height="'+(plotH/2)+'" rx="8" fill="#fbf7fc"/>'+
    '<rect x="'+(L+plotW/2)+'" y="'+T+'" width="'+(plotW/2)+'" height="'+(plotH/2)+'" rx="8" fill="#fff7fa"/>'+
    '<rect x="'+L+'" y="'+(T+plotH/2)+'" width="'+(plotW/2)+'" height="'+(plotH/2)+'" rx="8" fill="#fafafa"/>'+
    '<rect x="'+(L+plotW/2)+'" y="'+(T+plotH/2)+'" width="'+(plotW/2)+'" height="'+(plotH/2)+'" rx="8" fill="#f5fbf7"/>'+
    ticks.map(t=>'<line x1="'+x(t)+'" y1="'+T+'" x2="'+x(t)+'" y2="'+(H-B)+'" stroke="#e5eaed" stroke-width="1"/><text x="'+x(t)+'" y="'+(H-B+19)+'" text-anchor="middle" font-size="11" fill="#727b80">'+t+'</text>').join('')+
    ticks.map(t=>'<line x1="'+L+'" y1="'+y(t)+'" x2="'+(W-R)+'" y2="'+y(t)+'" stroke="#e5eaed" stroke-width="1"/><text x="'+(L-12)+'" y="'+(y(t)+4)+'" text-anchor="end" font-size="11" fill="#727b80">'+t+'</text>').join('')+
    '<line x1="'+(L+plotW/2)+'" y1="'+T+'" x2="'+(L+plotW/2)+'" y2="'+(H-B)+'" stroke="#cad3d7" stroke-width="1.4"/>'+
    '<line x1="'+L+'" y1="'+(T+plotH/2)+'" x2="'+(W-R)+'" y2="'+(T+plotH/2)+'" stroke="#cad3d7" stroke-width="1.4"/>'+
    '<text x="'+(L+plotW*.25)+'" y="'+(T+20)+'" text-anchor="middle" font-size="11" font-weight="800" fill="#677075">High friction / lower readiness</text>'+
    '<text x="'+(L+plotW*.75)+'" y="'+(T+20)+'" text-anchor="middle" font-size="11" font-weight="800" fill="#9c305a">High friction / ready</text>'+
    '<text x="'+(L+plotW*.25)+'" y="'+(H-B-12)+'" text-anchor="middle" font-size="11" font-weight="800" fill="#677075">Low friction / lower readiness</text>'+
    '<text x="'+(L+plotW*.75)+'" y="'+(H-B-12)+'" text-anchor="middle" font-size="11" font-weight="800" fill="#27724c">Low friction / ready</text>'+
    rows.map((r,i)=>'<g><title>'+esc(r.persona)+' — Readiness '+r.ready+'%, friction '+r.friction+'%</title><circle cx="'+x(r.ready)+'" cy="'+y(r.friction)+'" r="15" fill="#fff" stroke="#0076a8" stroke-width="3"/><circle cx="'+x(r.ready)+'" cy="'+y(r.friction)+'" r="11" fill="#0076a8"/><text x="'+x(r.ready)+'" y="'+(y(r.friction)+4)+'" text-anchor="middle" font-size="11" font-weight="900" fill="#fff">'+(i+1)+'</text></g>').join('')+
    '<text x="'+(L+plotW/2)+'" y="'+(H-10)+'" text-anchor="middle" font-size="12" font-weight="750" fill="#5d666a">Readiness →</text>'+
    '<text x="16" y="'+(T+plotH/2)+'" transform="rotate(-90 16 '+(T+plotH/2)+')" text-anchor="middle" font-size="12" font-weight="750" fill="#5d666a">Implementation friction →</text>'+
    '</svg></div><div class="pmr-rf-legend">'+rows.map((r,i)=>'<article><span>'+(i+1)+'</span><div><strong>'+esc(r.persona)+'</strong><small>Readiness '+r.ready+'% · Friction '+r.friction+'%</small></div></article>').join('')+'</div></div>';
}
function pmrThemeTable(themes){
  return '<div class="table-scroll"><table class="data-table"><thead><tr><th>Theme</th><th>What we heard</th><th>Commonly raised by</th><th>Implication</th></tr></thead><tbody>'+
    themes.map((t,i)=>'<tr><td><strong>'+esc(t.theme)+'</strong></td><td>'+t.frequency+'% of coded interviews mention the topic</td><td>'+esc(pmrCfg().personas[i%pmrCfg().personas.length])+'</td><td>'+esc(i%2?"Opportunity to improve workflow, service or implementation support.":"Potential value-proposition and product-requirement input.")+'</td></tr>').join('')+'</tbody></table></div>';
}

/* VOC v2 — more conventional qualitative components, less abstract scoring */
function renderVOCPage(){
  const d=pmrData(),cfg=d.config,v2=pmrV2(),s=pmrIntelState.voc,qual=d.projects.filter(p=>["In-depth interviews","Patient / caregiver interviews","Workflow observation + IDI"].includes(p.type));
  const projectOptions=[{value:"All qualitative projects",label:"All qualitative projects"},...qual.map(p=>({value:p.id,label:p.name}))],themes=pmrThemeRows(s),personas=pmrPersonaRows(s);
  const base=pmrFilteredBase(s.project==="All qualitative projects"?qual.reduce((a,p)=>a+p.sample,0):(qual.find(p=>p.id===s.project)?.sample||0),s);
  const pref=(v2.voc?.preferences||[]).filter(x=>s.persona==="All personas"||x.persona===s.persona);
  const readiness=(v2.voc?.readiness||[]).filter(x=>s.persona==="All personas"||x.persona===s.persona);
  $('breadcrumbSmall').textContent='Primary Market Research / Voice of customer Study';$('breadcrumbTitle').textContent=currentDomain+' — Voice of customer';
  $('pageContent').innerHTML=pmrPageHead("Voice of customer study",'A study-style VOC workspace for <b>'+esc(currentDomain)+'</b> that brings together end-user interviews, journey research and workflow observations across physicians, nurses, administrators, patients and other customer types.')+
    '<section class="pmr-filter-shell five">'+pmrSelect("Project","project",projectOptions,s.project,"voc")+pmrSelect("Persona","persona",["All personas",...cfg.personas],s.persona,"voc")+pmrSelect("Region","region",["All regions",...cfg.regions],s.region,"voc")+pmrSelect("Care setting","setting",["All settings",...cfg.settings],s.setting,"voc")+pmrSelect("Theme","theme",["All themes",...cfg.themes],s.theme,"voc")+'</section>'+
    '<section class="section">'+pmrKpis([
      {label:"Filtered interview base",value:"n="+base,note:s.project},
      {label:"Customer types",value:personas.length,note:"Clinical + operational + patient"},
      {label:"Markets represented",value:s.region==="All regions"?cfg.regions.length:1,note:s.region},
      {label:"Qualitative projects",value:qual.length,note:"VOC + journey + workflow"},
      {label:"Most mentioned need",value:(v2.voc?.customerGoals||[]).slice().sort((a,b)=>b.mentions-a.mentions)[0]?.label||"N/A",note:"Interview-coded"},
      {label:"Highest pain point",value:(v2.voc?.painPoints||[]).slice().sort((a,b)=>b.mentions-a.mentions)[0]?.label||"N/A",note:"Interview-coded"}
    ])+'</section>'+
    '<section class="section"><div class="pmr-study-callout"><span>Overall VOC takeaway</span><strong>'+esc(v2.headline||"")+'</strong><p>Findings shown below are synthetic but structured to mirror a completed multi-persona qualitative research program.</p></div></section>'+
    '<section class="section"><div class="grid-3"><div class="card"><div class="card-title"><h3>Customer goals</h3><small>Share of interviews mentioning</small></div>'+pmrSimpleMentionList(v2.voc.customerGoals)+'</div><div class="card"><div class="card-title"><h3>Pain points & consequences</h3><small>What makes the current experience harder</small></div>'+pmrSimpleMentionList(v2.voc.painPoints)+'</div><div class="card"><div class="card-title"><h3>Decision triggers</h3><small>What moves customers toward action</small></div>'+pmrHorizontalBars(v2.voc.triggers.map(x=>({label:x.label,value:x.share,display:x.share+"%"})).sort((a,b)=>b.value-a.value),100)+'</div></div></section>'+
    '<section class="section"><div class="grid-2"><div class="card"><div class="card-title"><h3>Customer journey & moments of truth</h3><small>Where friction accumulates</small></div>'+pmrJourneyChart(s)+'</div><div class="card pmr-rf-card"><div class="card-title"><h3>Readiness × friction</h3><small>Persona implementation view</small></div>'+pmrReadinessFriction(readiness)+'</div></div></section>'+
    '<section class="section"><div class="section-head"><div><h2>Persona-specific preference</h2><p>What each customer group values most, what creates resistance and which proof points are expected.</p></div></div>'+pmrPreferenceCards(pref)+'</section>'+
    '<section class="section"><div class="grid-2"><div class="card"><div class="card-title"><h3>Information sources influencing decisions</h3><small>Reported influence in the demo interviews</small></div>'+pmrHorizontalBars(v2.voc.channels.map(x=>({label:x.label,value:x.share,display:x.share+"%"})).sort((a,b)=>b.value-a.value),100)+'</div><div class="card"><div class="card-title"><h3>Support expected from suppliers</h3><small>Most requested support components</small></div>'+pmrHorizontalBars(v2.voc.support.map(x=>({label:x.label,value:x.share,display:x.share+"%"})).sort((a,b)=>b.value-a.value),100)+'</div></div></section>'+
    '<section class="section"><div class="section-head"><div><h2>Persona × theme matrix</h2><p>Interview coding view showing which customer groups most frequently raised each topic.</p></div></div><div class="card">'+ci2Heatmap(personas.map(x=>x.persona),themes.map(x=>x.theme),(persona,theme)=>1+(pmrHash(currentDomain+persona+theme+pmrFilterText(s))%5),"1 = mentioned occasionally; 5 = recurring theme across several interviews. Synthetic coding matrix.")+'</div></section>'+
    '<section class="section"><div class="grid-2"><div class="card"><div class="card-title"><h3>Theme heatmap & implications</h3><small>Qualitative coding summary</small></div>'+pmrThemeTable(themes)+'</div><div class="card"><div class="card-title"><h3>Patterns observed across customers</h3><small>Cross-persona synthesis</small></div>'+pmrPatternCards(v2.voc.currentPatterns)+'</div></div></section>'+
    '<section class="section"><div class="section-head"><div><h2>Representative customer evidence</h2><p>Illustrative verbatims are tagged by persona, setting, region and theme to resemble a transcript evidence bank.</p></div><span class="pmr-demo-badge small">Synthetic verbatim</span></div>'+pmrQuotes(s)+'</section>'+
    '<section class="section"><div class="section-head"><div><h2>Risk assessment</h2><p>Risks that could reduce adoption or weaken the customer experience if left unresolved.</p></div></div><div class="card">'+pmrRiskTable(v2.risks||[])+'</div></section>'+
    '<section class="section"><div class="section-head"><div><h2>Executive recommendations</h2><p>Actions synthesized from the customer evidence, with a practical sequencing lens.</p></div></div>'+pmrExecutiveRecommendations()+'</section>'+
    '<section class="section"><div class="section-head"><div><h2>Roadmap</h2><p>Illustrative next-step plan for converting VOC findings into product, service and commercial actions.</p></div></div>'+pmrRoadmap()+'</section>'+
    pmrMethodsFooter();
}

/* Expert & KOL v2 */
function pmrExpertFeed(state){
  const rows=(pmrV2().expertFeed||[]).filter(x=>(state.expert==="All expert types"||x.expert===state.expert)&&(state.theme==="All themes"||x.theme===state.theme)&&(state.region==="All regions"||x.region===state.region));
  return '<div class="pmr-expert-feed">'+(rows.length?rows.map(x=>'<article><div><span>'+esc(x.expert)+'</span><em>'+esc(x.priority)+' priority</em></div><strong>'+esc(x.theme)+'</strong><blockquote>“'+esc(x.insight)+'”</blockquote><p>'+esc(x.region)+' · Expert interview</p></article>').join(''):'<div class="ci-empty">No expert insight matches the current filters.</div>')+'</div>';
}
function pmrConsensusTable(themes){
  return '<div class="table-scroll"><table class="data-table"><thead><tr><th>Theme</th><th>Expert consensus</th><th>Momentum</th><th>Interpretation</th><th>Recommended follow-up</th></tr></thead><tbody>'+
    themes.map(t=>'<tr><td><strong>'+esc(t.theme)+'</strong></td><td>'+t.consensus+'%</td><td>'+t.momentum+'%</td><td>'+esc(t.consensus>=80?"Broad agreement; suitable for immediate strategic use.":t.consensus>=65?"Directional consensus with important nuance by expert type.":"Divergent views; treat as a hypothesis rather than a settled conclusion.")+'</td><td>'+esc(t.consensus<65?"Run targeted follow-up interviews / quantitative validation.":"Translate into product, evidence or commercial planning.")+'</td></tr>').join('')+'</tbody></table></div>';
}
function pmrThemeReadinessRows(themes,state){
  return themes.map(t=>({persona:t.theme,ready:pmrAdj(48+t.momentum/2,t.theme+"ready",state,7),friction:pmrAdj(30+(100-t.consensus)/2,t.theme+"friction",state,7)}));
}
function renderExpertPage(){
  const d=pmrData(),cfg=d.config,v2=pmrV2(),s=pmrIntelState["expert-interviews"],projects=pmrExpertProjects(),projectOptions=[{value:"All interview projects",label:"All interview projects"},...projects.map(p=>({value:p.id,label:p.name}))];
  let themes=pmrExpertThemeRows(s);if(s.consensus==="High consensus")themes=themes.filter(x=>x.consensus>=80);if(s.consensus==="Mixed")themes=themes.filter(x=>x.consensus>=65&&x.consensus<80);if(s.consensus==="Divergent")themes=themes.filter(x=>x.consensus<65);
  const experts=s.expert==="All expert types"?d.expertMetrics:d.expertMetrics.filter(x=>x.persona===s.expert),base=pmrFilteredBase(s.project==="All interview projects"?projects.reduce((a,p)=>a+p.sample,0):(projects.find(p=>p.id===s.project)?.sample||0),s);
  $('breadcrumbSmall').textContent='Primary Market Research / Expert & KOL Interview Analysis';$('breadcrumbTitle').textContent=currentDomain+' — Expert & KOL analysis';
  $('pageContent').innerHTML=pmrPageHead("Expert & KOL interview analysis",'A cross-project synthesis of KOL interviews, expert transcripts and qualitative final reports for <b>'+esc(currentDomain)+'</b>, highlighting consensus, disagreement, emerging signals, evidence expectations, risks and implications.')+
    '<section class="pmr-filter-shell five">'+pmrSelect("Project","project",projectOptions,s.project,"expert-interviews")+pmrSelect("Expert type","expert",["All expert types",...cfg.expertTypes],s.expert,"expert-interviews")+pmrSelect("Region","region",["All regions",...cfg.regions],s.region,"expert-interviews")+pmrSelect("Theme","theme",["All themes",...cfg.themes],s.theme,"expert-interviews")+pmrSelect("Consensus","consensus",["All consensus levels","High consensus","Mixed","Divergent"],s.consensus,"expert-interviews")+'</section>'+
    '<section class="section">'+pmrKpis([
      {label:"Filtered interview base",value:"n="+base,note:"KOL + workflow + end-user studies"},
      {label:"Expert archetypes",value:experts.length,note:s.expert},
      {label:"Themes analyzed",value:themes.length,note:s.theme},
      {label:"High-consensus themes",value:themes.filter(x=>x.consensus>=80).length,note:"Consensus ≥80%"},
      {label:"Divergent themes",value:themes.filter(x=>x.consensus<65).length,note:"Requires further validation"},
      {label:"Strategic recommendations",value:d.recommendations.length,note:"Cross-project synthesis"}
    ])+'</section>'+
    '<section class="section"><div class="pmr-study-callout"><span>Cross-project synthesis</span><strong>'+esc(v2.headline||"")+'</strong><p>Expert outputs combine future-state views with end-user and workflow evidence to identify where the market is likely to move and what still needs validation.</p></div></section>'+
    '<section class="section"><div class="grid-2"><div class="card"><div class="card-title"><h3>Theme heatmap</h3><small>Expert archetype × topic intensity</small></div>'+ci2Heatmap(experts.map(x=>x.persona),themes.map(x=>x.theme),(e,t)=>1+(pmrHash(currentDomain+e+t+pmrFilterText(s))%5),"Synthetic thematic coding. 5 = recurring / high-salience topic.")+'</div><div class="card pmr-rf-card"><div class="card-title"><h3>Readiness × friction</h3><small>Theme-level implementation outlook</small></div>'+pmrReadinessFriction(pmrThemeReadinessRows(themes,s))+'</div></div></section>'+
    '<section class="section"><div class="section-head"><div><h2>Expert insight feed</h2><p>Transcript-style insight stream filtered by expert type, geography and theme.</p></div><span class="pmr-demo-badge small">Synthetic expert evidence</span></div>'+pmrExpertFeed(s)+'</section>'+
    '<section class="section"><div class="grid-3"><div class="card"><div class="card-title"><h3>Expert mix</h3><small>Interview distribution</small></div>'+ciDonut(experts.map(x=>({label:x.persona,value:x.interviews})))+'</div><div class="card"><div class="card-title"><h3>Innovation outlook</h3><small>Expected pace of change</small></div>'+pmrHorizontalBars(experts.map(x=>({label:x.persona,value:pmrAdj(x.innovation,x.persona+"innovation",s,7)})).sort((a,b)=>b.value-a.value),100)+'</div><div class="card"><div class="card-title"><h3>Evidence expectation</h3><small>Strength of proof expected before adoption</small></div>'+pmrHorizontalBars(experts.map(x=>({label:x.persona,value:pmrAdj(x.evidence,x.persona+"evidence",s,7)})).sort((a,b)=>b.value-a.value),100)+'</div></div></section>'+
    '<section class="section"><div class="section-head"><div><h2>Consensus, divergence & future signal table</h2><p>Separates broadly agreed findings from topics that remain uncertain or persona-dependent.</p></div></div><div class="card">'+pmrConsensusTable(themes)+'</div></section>'+
    '<section class="section"><div class="grid-2"><div class="card"><div class="card-title"><h3>Cross-project recurrence</h3><small>How often themes appear across qualitative studies</small></div>'+pmrHorizontalBars(themes.map(t=>({label:t.theme,value:1+(pmrHash(currentDomain+t.theme+"projects")%projects.length),display:(1+(pmrHash(currentDomain+t.theme+"projects")%projects.length))+" / "+projects.length})),projects.length)+'</div><div class="card"><div class="card-title"><h3>Patterns & hypotheses</h3><small>What the research team would carry forward</small></div>'+pmrPatternCards((v2.voc?.currentPatterns||[]).slice(0,5))+'</div></div></section>'+
    '<section class="section"><div class="section-head"><div><h2>Risk assessment</h2><p>Strategic risks and evidence gaps surfaced by experts.</p></div></div><div class="card">'+pmrRiskTable(v2.risks||[])+'</div></section>'+
    '<section class="section"><div class="section-head"><div><h2>Executive recommendations</h2><p>Cross-project actions prioritized from expert consensus, end-user needs and implementation constraints.</p></div></div>'+pmrExecutiveRecommendations()+'</section>'+
    '<section class="section"><div class="section-head"><div><h2>Roadmap</h2><p>How to move from expert hypotheses to validated strategic action.</p></div></div>'+pmrRoadmap()+'</section>'+
    pmrMethodsFooter();
}

/* Quantitative v2 */
function pmrLikert(rows,state){
  return '<div class="pmr-likert">'+rows.map(r=>{const favorable=r.top2,neutral=Math.max(10,Math.round((100-favorable)*.42)),unfav=100-favorable-neutral;return '<article><span>'+esc(r.label)+'</span><div><i class="neg" style="width:'+unfav+'%"></i><i class="neutral" style="width:'+neutral+'%"></i><i class="pos" style="width:'+favorable+'%"></i></div><b>'+favorable+'% favorable</b></article>'}).join('')+'</div>';
}
function pmrWaveTrend(project,state){
  const labels=["2025 Q4","2026 Q1","2026 Q2","2026 Q3"],base=54+(pmrHash(project.id+state.outcome)%20);
  return labels.map((label,i)=>({label,value:pmrClamp(base+i*(2+(pmrHash(label+project.id)%4))+((pmrHash(label+pmrFilterText(state))%5)-2))}));
}
function pmrSubgroupDeltas(rows,state){
  const cfg=pmrCfg();return (state.persona==="All personas"?cfg.personas:[state.persona]).map((p,i)=>({label:p,value:(pmrHash(currentDomain+p+state.outcome)%21)-10,display:(((pmrHash(currentDomain+p+state.outcome)%21)-10)>0?"+":"")+((pmrHash(currentDomain+p+state.outcome)%21)-10)+" pts"}));
}
function pmrOpenEndThemes(state){
  return pmrThemeRows(state).slice().sort((a,b)=>b.frequency-a.frequency).slice(0,6).map((t,i)=>({label:t.theme,value:pmrClamp(24+t.frequency/2+(pmrHash(t.theme+"oe")%10)),display:pmrClamp(24+t.frequency/2+(pmrHash(t.theme+"oe")%10))+"% coded mentions"}));
}
function renderQuantPage(){
  const d=pmrData(),cfg=d.config,v2=pmrV2(),s=pmrIntelState["quant-surveys"],projects=pmrQuantProjects();if(!projects.some(p=>p.id===s.project))s.project=projects[0]?.id||"";
  const project=projects.find(p=>p.id===s.project)||projects[0],rows=pmrSurveyRows(s),personaComp=pmrSampleComposition(project,s),regionComp=pmrRegionComposition(project,s),segments=pmrSegments(project,s),filteredN=pmrFilteredBase(project.sample,s);
  const strongest=rows.slice().sort((a,b)=>b.driver-a.driver)[0],gap=rows.slice().sort((a,b)=>(b.importance-b.satisfaction)-(a.importance-a.satisfaction))[0];
  const readiness=(v2.voc?.readiness||[]).filter(x=>s.persona==="All personas"||x.persona===s.persona);
  const outcomes=["Overall experience","Adoption intent","Future preference","Digital readiness","Recommendation / advocacy"];
  $('breadcrumbSmall').textContent='Primary Market Research / Quantitative survey Analysis';$('breadcrumbTitle').textContent=currentDomain+' — Quantitative survey';
  $('pageContent').innerHTML=pmrPageHead("Quantitative survey analysis",'A project-style analytical workspace for <b>'+esc(currentDomain)+'</b>, showing how Abbott could go beyond standard survey charting with dynamic cross-tabs, derived segments, drivers, subgroup deltas, open-text coding and action-oriented synthesis.')+
    '<section class="pmr-filter-shell five">'+pmrSelect("Survey project","project",projects.map(p=>({value:p.id,label:p.name})),s.project,"quant-surveys")+pmrSelect("Persona","persona",["All personas",...cfg.personas],s.persona,"quant-surveys")+pmrSelect("Region","region",["All regions",...cfg.regions],s.region,"quant-surveys")+pmrSelect("Care setting","setting",["All settings",...cfg.settings],s.setting,"quant-surveys")+pmrSelect("Outcome","outcome",outcomes,s.outcome,"quant-surveys")+'</section>'+
    '<section class="section">'+pmrKpis([
      {label:"Filtered analytical base",value:"n="+filteredN,note:filteredN===project.sample?"Full survey":"Current crosstab cut"},
      {label:"Fieldwork quality",value:d.fieldwork.qualityPass+"%",note:"Synthetic QC pass"},
      {label:"Mean survey length",value:(9+(pmrHash(project.id+"loi")%6))+" min",note:project.method},
      {label:"Strongest modeled driver",value:strongest?.label||"N/A",note:"β "+(strongest?.driver||0).toFixed(2)},
      {label:"Largest improvement gap",value:gap?.label||"N/A",note:gap?((gap.importance-gap.satisfaction)+" pts"):""},
      {label:"Outcome in view",value:s.outcome,note:"All visuals refresh dynamically"}
    ])+'</section>'+
    '<section class="section"><div class="pmr-study-callout"><span>Quantitative synthesis</span><strong>'+esc((v2.quantNarratives||[])[pmrHash(s.project+s.outcome)%Math.max((v2.quantNarratives||[]).length,1)]||"")+'</strong><p>The displayed coefficients, significance flags, segment sizes and distributions are synthetic demo outputs designed to resemble a completed survey analytics project.</p></div></section>'+
    '<section class="section"><div class="grid-3"><div class="card"><div class="card-title"><h3>Sample by persona</h3><small>Filtered analytical base</small></div>'+ciDonut(personaComp)+'</div><div class="card"><div class="card-title"><h3>Sample by region</h3><small>Current survey cut</small></div>'+pmrHorizontalBars(regionComp,Math.max(...regionComp.map(x=>x.value),1))+'</div><div class="card"><div class="card-title"><h3>Respondent segments</h3><small>Illustrative cluster solution</small></div>'+ciDonut(segments)+'</div></div></section>'+
    '<section class="section"><div class="grid-2"><div class="card"><div class="card-title"><h3>Response distribution</h3><small>Favorable / neutral / unfavorable</small></div>'+pmrLikert(rows,s)+'</div><div class="card"><div class="card-title"><h3>Outcome trend by wave</h3><small>'+esc(s.outcome)+'</small></div>'+ciLineChart(pmrWaveTrend(project,s),"label","value")+'</div></div></section>'+
    '<section class="section"><div class="grid-2"><div class="card"><div class="card-title"><h3>Importance × performance</h3><small>Prioritize improvement areas</small></div>'+pmrScatter(rows.map(r=>({...r,theme:r.label})),"satisfaction","importance","Current performance","Importance")+'</div><div class="card pmr-rf-card"><div class="card-title"><h3>Readiness × friction</h3><small>Persona view</small></div>'+pmrReadinessFriction(readiness)+'</div></div></section>'+
    '<section class="section"><div class="section-head"><div><h2>Persona × theme matrix</h2><p>Dynamic crosstab showing how Top-2-box results vary by persona under the selected project / region / setting / outcome.</p></div></div><div class="card">'+ci2Heatmap(s.persona==="All personas"?cfg.personas:[s.persona],rows.map(r=>r.label),(persona,theme)=>{const r=rows.find(x=>x.label===theme);return pmrAdj(r.top2,persona+theme,s,12)},"Synthetic Top-2-box %. Production dashboard would add weighted base sizes and significance markers.")+'</div></section>'+
    '<section class="section"><div class="grid-3"><div class="card"><div class="card-title"><h3>Driver strength</h3><small>Relationship with '+esc(s.outcome)+'</small></div>'+pmrHorizontalBars(rows.map(r=>({label:r.label,value:r.driver*100,display:r.driver.toFixed(2)})).sort((a,b)=>b.value-a.value),65)+'</div><div class="card"><div class="card-title"><h3>Persona-specific preference delta</h3><small>Versus total sample</small></div>'+pmrHorizontalBars(pmrSubgroupDeltas(rows,s).map(x=>({label:x.label,value:Math.abs(x.value),display:x.display})),12)+'</div><div class="card"><div class="card-title"><h3>Open-text theme coding</h3><small>Share of coded responses</small></div>'+pmrHorizontalBars(pmrOpenEndThemes(s),100)+'</div></div></section>'+
    '<section class="section"><div class="section-head"><div><h2>Driver model detail</h2><p>Illustrative multivariate output with statistical significance and business interpretation.</p></div><span class="pmr-demo-badge small">Illustrative statistics</span></div><div class="card">'+pmrDriverTable(rows)+'</div></section>'+
    '<section class="section"><div class="grid-2"><div class="card"><div class="card-title"><h3>Persona-specific preference</h3><small>What each customer type prioritizes</small></div>'+pmrPreferenceCards((v2.voc?.preferences||[]).filter(x=>s.persona==="All personas"||x.persona===s.persona))+'</div><div class="card"><div class="card-title"><h3>Patterns emerging from survey cuts</h3><small>Illustrative synthesis</small></div>'+pmrPatternCards((v2.voc?.currentPatterns||[]).slice(0,5))+'</div></div></section>'+
    '<section class="section"><div class="section-head"><div><h2>Risk assessment</h2><p>Risks to adoption or interpretation that should be carried into decision making.</p></div></div><div class="card">'+pmrRiskTable(v2.risks||[])+'</div></section>'+
    '<section class="section"><div class="section-head"><div><h2>Executive recommendations</h2><p>Actions translated from the survey findings and subgroup differences.</p></div></div>'+pmrExecutiveRecommendations()+'</section>'+
    '<section class="section"><div class="section-head"><div><h2>Roadmap</h2><p>Suggested sequence from analytical validation to pilot, scale and ongoing measurement.</p></div></div>'+pmrRoadmap()+'</section>'+
    pmrMethodsFooter();
}
