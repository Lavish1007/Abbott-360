function renderSegmentOverview(type){
  const list=type==='ci'?CI_SUBSEGMENTS:PMR_SUBSEGMENTS;
  const name=type==='ci'?'Competitive Intelligence':'Primary Market Research';
  const d=DOMAIN_DATA[currentDomain],en=enrichment();
  $('breadcrumbSmall').textContent='Abbott 360 / '+name;
  $('breadcrumbTitle').textContent=currentDomain+' — '+name;
  const theme=globalFilters.theme==='All themes'?'all priority themes':globalFilters.theme;
  $('pageContent').innerHTML=
    '<div class="page-head"><div class="title-wrap"><div class="breadcrumb"><button onclick="navigate(\'executive\')">Executive Hub</button> / '+name+'</div>'+
    '<h1>'+name+'</h1><p>'+(type==='ci'?'A connected capability stack for continuous market sensing, competitor monitoring and strategic interpretation.':'A modular research stack to validate market hypotheses directly with customers, clinicians, buyers, patients and experts.')+
    ' The current view is configured for <b>'+esc(currentDomain)+'</b> and '+esc(theme)+'.</p></div></div>'+
    activeFilterNote()+
    '<div class="research-note"><strong>Domain context:</strong> '+esc(d.landscape)+' '+(en.market?'<b>Public market context:</b> '+esc(en.market.label)+' is estimated at $'+en.market.current.toFixed(2)+'B in '+en.market.currentYear+'.':'')+'</div>'+
    '<section class="section"><div class="capability-grid">'+list.map(x=>'<button class="cap-card" onclick="navigate(\''+type+'\',\''+x.id+'\')"><div class="cap-icon">'+x.icon+'</div><h3>'+esc(x.title)+'</h3><p>'+esc(x.overview)+'</p><span class="go">Open dedicated page →</span></button>').join('')+'</div></section>'+
    (type==='pmr'&&typeof renderPMRPortfolioOverview==='function'?renderPMRPortfolioOverview():'');
}

function scoreFrom(id,offset){let s=0;for(const c of id+currentDomain)s=(s+c.charCodeAt(0))%31;return Math.min(96,58+s+offset)}
function renderBars(labels,id){return labels.map((l,i)=>{const v=scoreFrom(id,i*4);return '<div class="metric-bar"><span>'+esc(l)+'</span><div class="bar"><i style="width:'+v+'%"></i></div><b>'+v+'</b></div>'}).join('')}

function researchContext(d){
  const ev=(window.DOMAIN_EVIDENCE&&DOMAIN_EVIDENCE[currentDomain])||{};
  const forces=(ev.forces&&ev.forces.length)?ev.forces:d.dynamics.map(x=>x.body);
  let rows=forces.map((x,i)=>({title:(d.dynamics[i]&&d.dynamics[i].title)||('Market force '+(i+1)),body:x}));
  if(globalFilters.theme!=='All themes'){
    const q=globalFilters.theme.toLowerCase().split(' / ')[0];
    const hit=rows.filter(x=>(x.title+' '+x.body).toLowerCase().includes(q));
    if(hit.length)rows=hit;
  }
  return '<div class="insight-strip">'+rows.slice(0,3).map(x=>'<div class="insight-box"><strong>'+esc(x.title)+'</strong><span>'+esc(x.body)+'</span></div>').join('')+'</div>';
}

function renderArchitecture(type,id){
  const bp=window.MODULE_BLUEPRINTS&&MODULE_BLUEPRINTS[type]&&MODULE_BLUEPRINTS[type][id];
  if(!bp)return '';
  return '<div class="card"><div class="card-title"><h3>Research & data architecture</h3><span class="pill">Module-specific</span></div>'+
    '<p class="module-objective">'+esc(bp.objective)+'</p>'+
    '<div class="table-scroll"><table class="data-table"><thead><tr><th>Data block</th><th>Datapoints to capture</th><th>Best representation</th></tr></thead><tbody>'+
    bp.dataRows.map(r=>'<tr><td><strong>'+esc(r[0])+'</strong></td><td>'+esc(r[1])+'</td><td><span class="visual-tag">'+esc(r[2])+'</span></td></tr>').join('')+
    '</tbody></table></div><div class="mini-tags module-lenses">'+bp.lenses.map(x=>'<span>'+esc(x)+'</span>').join('')+'</div></div>';
}

function renderEvidencePanel(d){
  const ev=(window.DOMAIN_EVIDENCE&&DOMAIN_EVIDENCE[currentDomain])||{},en=enrichment();
  const facts=(ev.facts&&ev.facts.length)?ev.facts:d.metrics;
  return '<div class="card"><div class="card-title"><h3>Sourced domain datapoints</h3><small>'+esc(ev.updated||'Current baseline')+'</small></div>'+
    '<div class="evidence-grid">'+facts.map(m=>'<div class="evidence-item"><b>'+esc(m.value)+'</b><strong>'+esc(m.label)+'</strong><span>'+esc(m.note)+'</span>'+(m.source!==undefined?'<em>S'+(m.source+1)+'</em>':'')+'</div>').join('')+'</div>'+
    (en.market?'<div class="embedded-market"><strong>'+esc(en.market.label)+'</strong>'+marketBarChart(en.market)+'</div>':'')+
    '<div class="research-note"><strong>Use:</strong> domain-level anchors provide context. Pair them with module-specific data in the adjacent architecture table and preserve source scope.</div></div>';
}

function matchingDomainLenses(type,id){
  const en=enrichment();
  const arr=type==='ci'?(en.ciLenses||[]):((en.pmrLenses||[]));
  return arr.filter(x=>(x.ids||[]).includes(id));
}
function renderDomainSpecificLens(type,id){
  const matches=matchingDomainLenses(type,id);
  if(!matches.length)return '';
  if(type==='ci'){
    return '<div class="card"><div class="card-title"><h3>Domain-specific intelligence lens</h3><small>'+esc(currentDomain)+'</small></div><div class="domain-lens-list">'+matches.map(x=>'<article><span class="lens-icon">CI</span><div><strong>'+esc(x.title)+'</strong><p>'+esc(x.scope)+'</p><em>'+esc(x.visual)+'</em></div></article>').join('')+'</div></div>';
  }
  return '<div class="card"><div class="card-title"><h3>Domain-specific PMR lens</h3><small>'+esc(currentDomain)+'</small></div><div class="domain-lens-list">'+matches.map(x=>'<article><span class="lens-icon">PM</span><div><strong>'+esc(x.stakeholders)+'</strong><p>'+esc(x.decision)+'</p><em>Use stakeholder, setting, geography and product-use filters</em></div></article>').join('')+'</div></div>';
}

function renderSignalFeed(){
  const en=enrichment(),signals=filteredSignals().length?filteredSignals():(en.signals||[]);
  if(!signals.length)return '<div class="empty-search">No current signals are loaded for this filter combination.</div>';
  return '<div class="signal-feed">'+signals.map(s=>'<article class="signal-card"><div><span class="signal-type">'+esc(s.type)+'</span><time>'+esc(s.date)+'</time></div><strong>'+esc(s.title)+'</strong><p>'+esc(s.detail)+'</p><a href="'+s.url+'" target="_blank" rel="noopener">'+esc(s.company)+' · source ↗</a></article>').join('')+'</div>';
}

function renderModuleSpotlight(type,id,d){
  if(type==='ci'&&id==='company-profiles'){
    const players=filteredPlayers(d);
    return '<div class="card"><div class="card-title"><h3>Representative competitor profile view</h3><small>'+(globalFilters.company==='All companies'?'Multi-company view':'Filtered company')+'</small></div><table class="player-table"><thead><tr><th>Company</th><th>Current focus</th><th>Illustrative watch intensity</th></tr></thead><tbody>'+
      players.map(p=>'<tr><td><strong>'+esc(p.name)+'</strong></td><td><p>'+esc(p.focus)+'</p></td><td><div class="signal-strength"><i style="width:'+p.signal+'%"></i></div></td></tr>').join('')+
      '</tbody></table><div class="research-note"><strong>Demo index:</strong> prioritization only; not market share or a performance rating.</div></div>';
  }
  if(type==='ci'&&id==='market-landscape'){
    const en=enrichment();
    return '<div class="card"><div class="card-title"><h3>Market context & category structure</h3><small>Public + domain taxonomy</small></div>'+(en.market?marketBarChart(en.market):'')+'<div class="stack-list">'+((en.themes||[]).slice(0,7)).map((x,i)=>'<div><span>0'+(i+1)+'</span><strong>'+esc(x)+'</strong></div>').join('')+'</div></div>';
  }
  if(type==='ci'&&['news-alerts','regulatory-clinical','pipeline-innovation','ma-partnerships'].includes(id)){
    return '<div class="card"><div class="card-title"><h3>Current signal queue</h3><small>Source-linked examples</small></div>'+renderSignalFeed()+'</div>';
  }
  if(type==='ci'){
    return '<div class="card"><div class="card-title"><h3>Competitor relevance</h3><small>Illustrative indexed view</small></div>'+renderBars(filteredPlayers(d).slice(0,5).map(p=>p.name),id)+'<div class="research-note"><strong>Demo index:</strong> replace with an explicit evidence-weighted prioritization method for production.</div></div>';
  }
  if(type==='pmr'&&['voc','workflow-unmet','journey-ux','adoption-readiness','human-factors'].includes(id)){
    return '<div class="card"><div class="card-title"><h3>Priority stakeholder lens</h3><small>Typical PMR sample framework</small></div><div class="persona-grid">'+
      '<div class="persona"><strong>Clinical users</strong><span>Physicians, surgeons, nurses, laboratorians or technicians depending on domain.</span></div>'+
      '<div class="persona"><strong>Economic buyers</strong><span>Administrators, procurement, value analysis, lab leadership or service-line leaders.</span></div>'+
      '<div class="persona"><strong>Influencers</strong><span>KOLs, educators, pathway owners and digital / operational stakeholders.</span></div>'+
      '<div class="persona"><strong>End users / patients</strong><span>Included where the decision journey or product experience directly involves them.</span></div></div></div>';
  }
  return '<div class="card"><div class="card-title"><h3>Example evidence dimensions</h3><small>Illustrative index</small></div>'+renderBars(['Need intensity','Current friction','Adoption readiness','Value clarity'],id)+'<div class="research-note"><strong>Demo index:</strong> replace with study outputs once a survey, interview, concept or model is connected.</div></div>';
}

function datasetFocusPanel(type,id,d){
  const mode=globalFilters.dataset,en=enrichment(),bp=window.MODULE_BLUEPRINTS&&MODULE_BLUEPRINTS[type]&&MODULE_BLUEPRINTS[type][id];
  if(mode==='Public market data'){
    return '<section class="section"><div class="grid-2">'+renderEvidencePanel(d)+'<div class="card"><div class="card-title"><h3>Market-source scope</h3><small>Interpretation guardrail</small></div><p>'+esc(en.market?en.market.scopeNote:'No additional market scope loaded.')+'</p><div class="research-note">Market-research publisher estimates are directional context. Confirm definition, geography, base year, currency and inclusion of devices, consumables, software or services before client-facing comparison.</div></div></div></section>';
  }
  if(mode==='Competitive signals'){
    return '<section class="section"><div class="card"><div class="card-title"><h3>Filtered competitive signal dataset</h3><small>Current examples</small></div>'+renderSignalFeed()+'</div></section>';
  }
  if(mode==='PMR blueprint'){
    return '<section class="section"><div class="grid-2">'+renderDomainSpecificLens(type,id)+(bp?renderArchitecture(type,id):'')+'</div></section>';
  }
  if(mode==='Illustrative demo'){
    return '<section class="section"><div class="grid-2"><div class="card chart-card"><div class="card-title"><h3>Illustrative workstream index</h3><small>Synthetic demo • 0–100</small></div>'+lineChart(d.trend.map((v,i)=>Math.min(98,v+(scoreFrom(id,i)%7)-3)),d.trendLabels)+'<div class="research-note"><strong>Synthetic:</strong> visualization only; not a research finding.</div></div><div class="card"><div class="card-title"><h3>Illustrative benchmark</h3><small>Demo only</small></div>'+renderBars(type==='ci'?filteredPlayers(d).slice(0,4).map(p=>p.name):['Need intensity','Friction','Readiness','Value clarity'],id)+'</div></div></section>';
  }
  return '';
}

function renderSubsegment(type,id){
  const list=type==='ci'?CI_SUBSEGMENTS:PMR_SUBSEGMENTS;
  const item=list.find(x=>x.id===id);
  if(!item){navigate(type);return}
  if(type==='ci'&&id==='company-profiles'){renderCompanyProfilesPage();return}
  if(type==='ci'&&['news-alerts','product-portfolio','ma-partnerships','social-digital','strategy-positioning','conference-kol'].includes(id)){renderCIIntelligence(id);return}
  if(type==='pmr'&&['voc','expert-interviews','quant-surveys'].includes(id)){renderPMRIntelligence(id);return}
  const d=DOMAIN_DATA[currentDomain],en=enrichment();
  const name=type==='ci'?'Competitive Intelligence':'Primary Market Research';
  const bp=window.MODULE_BLUEPRINTS&&MODULE_BLUEPRINTS[type]&&MODULE_BLUEPRINTS[type][id];
  $('breadcrumbSmall').textContent=name+' / '+item.title;
  $('breadcrumbTitle').textContent=currentDomain+' — '+item.title;

  const focus=datasetFocusPanel(type,id,d);
  const standardBody=globalFilters.dataset==='All datasets'?
    '<section class="section"><div class="grid-2">'+renderArchitecture(type,id)+renderEvidencePanel(d)+'</div></section>'+
    '<section class="section"><div class="grid-2">'+renderDomainSpecificLens(type,id)+renderModuleSpotlight(type,id,d)+'</div></section>'+
    '<section class="section"><div class="card"><div class="card-title"><h3>Current source-linked signals</h3><small>Filtered by company / theme where applicable</small></div>'+renderSignalFeed()+'</div></section>':'';

  $('pageContent').innerHTML=
    '<div class="page-head"><div class="title-wrap"><div class="breadcrumb"><button onclick="navigate(\'executive\')">Executive Hub</button> / <button onclick="openSegment(\''+type+'\')">'+name+'</button> / '+esc(item.title)+'</div>'+
    '<h1>'+esc(item.title)+'</h1><p>'+esc(item.overview)+' This dedicated page applies the capability to <b>'+esc(currentDomain)+'</b> and combines source-backed domain context, a module-specific data model, recommended visuals and decision questions.</p></div>'+
    '<div class="page-head-actions"><button onclick="showToast(\'View saved (prototype)\')">Save view</button><button class="primary" onclick="showToast(\''+(currentRole==='Viewer'?'Snapshot export prepared':'New workstream opened')+' (prototype)\')">'+(currentRole==='Viewer'?'Export':'Create workstream')+'</button></div></div>'+
    activeFilterNote()+
    '<section class="section"><div class="section-head"><div><h2>Domain research context</h2><p>Current market forces that should shape this workstream.</p></div></div>'+researchContext(d)+'</section>'+
    focus+standardBody+
    '<section class="section"><div class="grid-2"><div class="card"><div class="card-title"><h3>Business questions addressed</h3><span class="pill">'+item.questions.length+' core questions</span></div><div class="question-list">'+item.questions.map((q,i)=>'<div class="question-item"><div class="qnum">'+(i+1)+'</div><span>'+esc(q)+'</span></div>').join('')+'</div></div>'+
      '<div class="card"><div class="card-title"><h3>Typical outputs</h3><span class="pill pink">Decision-ready</span></div><div class="deliverable-list">'+item.deliverables.map((q,i)=>'<div class="deliverable-item"><div class="qnum">'+(i+1)+'</div><span>'+esc(q)+'</span></div>').join('')+'</div></div></div></section>'+
    '<section class="section"><div class="grid-2"><div class="card chart-card"><div class="card-title"><h3>Workstream opportunity index</h3><small>Illustrative • 0–100</small></div>'+lineChart(d.trend.map((v,i)=>Math.min(98,v+(scoreFrom(id,i)%7)-3)),d.trendLabels)+'<div class="research-note"><strong>Visualization note:</strong> synthetic values demonstrate dashboard behavior and must be replaced with approved study or intelligence data.</div></div>'+
      '<div class="card"><div class="card-title"><h3>Recommended analytical cuts</h3><small>Interactive filters</small></div><div class="mini-tags">'+((bp&&bp.lenses)||[]).concat(en.themes?en.themes.slice(0,4):d.opportunities.slice(0,4),['Geography','Care setting','Time period']).map(x=>'<span>'+esc(x)+'</span>').join('')+'</div><p style="margin-top:14px">Use the global Company, Theme and Dataset dropdowns to move between competitor-specific, thematic and evidence-layer views without changing the page.</p></div></div></section>'+
    '<section class="section"><div class="grid-2"><div class="card"><div class="card-title"><h3>Source basis</h3><small>Domain-level authoritative sources</small></div>'+sourcesHtml(d)+'</div>'+
      '<div class="card"><div class="card-title"><h3>Evidence governance</h3><small>Dashboard rules</small></div><div class="deliverable-list">'+
      '<div class="deliverable-item"><div class="qnum">1</div><span>Every external fact should retain source, publication date, geography, population or market scope and evidence type.</span></div>'+
      '<div class="deliverable-item"><div class="qnum">2</div><span>Observed competitive events should remain distinct from analyst implication, confidence and recommended action.</span></div>'+
      '<div class="deliverable-item"><div class="qnum">3</div><span>PMR outputs should retain study, wave, respondent base, question wording and segmentation logic.</span></div>'+
      '<div class="deliverable-item"><div class="qnum">4</div><span>Synthetic visuals should remain explicitly labeled and excluded from client-facing factual exports until replaced.</span></div>'+
      '</div></div></div></section>';
}

function runGlobalSearch(){
  const q=$('globalSearch').value.trim().toLowerCase();if(!q)return;
  const all=[...CI_SUBSEGMENTS.map(x=>({...x,type:'ci'})),...PMR_SUBSEGMENTS.map(x=>({...x,type:'pmr'}))];
  const hits=all.filter(x=>(x.title+' '+x.overview+' '+x.questions.join(' ')).toLowerCase().includes(q));
  $('breadcrumbSmall').textContent='Abbott 360 / Search';$('breadcrumbTitle').textContent='Results for “'+q+'”';
  $('pageContent').innerHTML='<div class="page-head"><div class="title-wrap"><div class="kicker">Global search</div><h1>Search results</h1><p>'+hits.length+' capability pages matched “'+esc(q)+'” in the current platform taxonomy.</p></div></div>'+activeFilterNote()+
    (hits.length?'<div class="capability-grid">'+hits.map(x=>'<button class="cap-card" onclick="navigate(\''+x.type+'\',\''+x.id+'\')"><div class="cap-icon">'+x.icon+'</div><h3>'+esc(x.title)+'</h3><p>'+esc(x.overview)+'</p><span class="go">Open page →</span></button>').join('')+'</div>':'<div class="empty-search">No capability page matched this search. Try terms such as pricing, workflow, competitor, regulatory, customer, usability, launch, concept, segmentation, social or adoption.</div>');
}

function handleHash(){const h=location.hash.replace('#','');if(!h)return;const parts=h.split('/');const t=parts[0],id=parts[1];if(['executive','ci','pmr'].includes(t)){currentPage={type:t,id:id};setActiveNav(t,id);renderCurrentPage()}}
window.addEventListener('hashchange',handleHash);
(function init(){renderDomainSelectors();if(!$('appScreen').classList.contains('hidden'))initializeApp()})();