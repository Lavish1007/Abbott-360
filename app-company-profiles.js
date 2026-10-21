let companyProfileState={domain:null,company:"",region:"All Regions",portfolio:"All Portfolio & Services",focus:"All Focus Areas"};

const CP_LOGO_DOMAINS={
  "Thermo Fisher Scientific":"thermofisher.com","Werfen":"werfen.com","Roche Diagnostics":"roche.com","Siemens Healthineers":"siemens-healthineers.com",
  "Revvity / EUROIMMUN":"euroimmun.com","Bio-Rad Laboratories":"bio-rad.com","Abbott":"abbott.com","Dexcom":"dexcom.com","Medtronic":"medtronic.com",
  "Insulet":"insulet.com","Tandem Diabetes Care":"tandemdiabetes.com","Senseonics":"senseonics.com","Alcon":"alcon.com","ZEISS Medical Technology":"zeiss.com",
  "Bausch + Lomb":"bausch.com","Johnson & Johnson Vision":"jnjvisionpro.com","Topcon":"topconhealthcare.com","NIDEK":"nidek-intl.com","Stryker":"stryker.com",
  "Zimmer Biomet":"zimmerbiomet.com","J&J MedTech / DePuy Synthes":"jnjmedtech.com","Smith+Nephew":"smith-nephew.com","Arthrex":"arthrex.com",
  "Globus Medical":"globusmedical.com","Enovis":"enovis.com","Convatec":"convatecgroup.com","Mölnlycke":"molnlycke.com","Solventum":"solventum.com",
  "Coloplast":"coloplast.com","Organogenesis":"organogenesis.com","Integra LifeSciences":"integralife.com","Quest Diagnostics":"questdiagnostics.com",
  "Labcorp":"labcorp.com","Sonic Healthcare":"sonichealthcare.com","Eurofins Scientific":"eurofins.com","Mayo Clinic Laboratories":"mayocliniclabs.com",
  "ARUP Laboratories":"aruplab.com","SYNLAB":"synlab.com"
};

function companyProfileData(){return (window.COMPANY_PROFILES&&COMPANY_PROFILES[currentDomain])||[]}
function resetCompanyProfileState(){
  const profiles=companyProfileData();
  companyProfileState={domain:currentDomain,company:profiles[0]?.id||"",region:"All Regions",portfolio:"All Portfolio & Services",focus:"All Focus Areas"};
}
function cpUnique(arr){return [...new Set(arr.filter(Boolean))].sort((a,b)=>a.localeCompare(b))}
function cpOptions(values,selected){return values.map(v=>'<option value="'+esc(v)+'" '+(v===selected?'selected':'')+'>'+esc(v)+'</option>').join('')}
function cpInitials(name){return name.replaceAll('/',' ').replaceAll('+',' ').split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase()}
function cpLogoDomain(name){return CP_LOGO_DOMAINS[name]||Object.entries(CP_LOGO_DOMAINS).find(([k])=>name.includes(k)||k.includes(name))?.[1]||null}
function cpCompanyLogo(name,size){
  const domain=cpLogoDomain(name),cls=size==='large'?'cp-selected-logo large':'cp-selected-logo';
  if(!domain)return '<span class="'+cls+' fallback">'+esc(cpInitials(name))+'</span>';
  return '<a class="'+cls+'" href="https://'+domain+'" target="_blank" rel="noopener" title="Open official company website"><img src="https://www.google.com/s2/favicons?domain='+domain+'&sz=128" alt="'+esc(name)+' logo"/><span class="fallback-text">'+esc(cpInitials(name))+'</span></a>';
}

function cpMatchesExcept(p,exceptKey){
  const s=companyProfileState;
  if(exceptKey!=="region"&&s.region!=="All Regions"&&!(p.regions||[]).includes(s.region))return false;
  if(exceptKey!=="portfolio"&&s.portfolio!=="All Portfolio & Services"&&!(p.portfolioTags||[]).includes(s.portfolio))return false;
  if(exceptKey!=="focus"&&s.focus!=="All Focus Areas"&&!(p.focusTags||[]).includes(s.focus))return false;
  return true;
}
function cpCurrentCandidates(){return companyProfileData().filter(p=>cpMatchesExcept(p,"company"))}
function cpAvailableValues(key){
  const rows=companyProfileData().filter(p=>cpMatchesExcept(p,key));
  if(key==="region")return cpUnique(rows.flatMap(p=>p.regions||[]));
  if(key==="portfolio")return cpUnique(rows.flatMap(p=>p.portfolioTags||[]));
  if(key==="focus")return cpUnique(rows.flatMap(p=>p.focusTags||[]));
  return [];
}
function cpNormalizeState(){
  if(companyProfileState.domain!==currentDomain)resetCompanyProfileState();
  const regionVals=cpAvailableValues("region");
  if(companyProfileState.region!=="All Regions"&&!regionVals.includes(companyProfileState.region))companyProfileState.region="All Regions";
  const portfolioVals=cpAvailableValues("portfolio");
  if(companyProfileState.portfolio!=="All Portfolio & Services"&&!portfolioVals.includes(companyProfileState.portfolio))companyProfileState.portfolio="All Portfolio & Services";
  const focusVals=cpAvailableValues("focus");
  if(companyProfileState.focus!=="All Focus Areas"&&!focusVals.includes(companyProfileState.focus))companyProfileState.focus="All Focus Areas";
  const candidates=cpCurrentCandidates();
  if(!candidates.some(p=>p.id===companyProfileState.company))companyProfileState.company=candidates[0]?.id||companyProfileData()[0]?.id||"";
}
function updateCompanyProfileFilter(key,value){
  if(companyProfileState.domain!==currentDomain)resetCompanyProfileState();
  companyProfileState[key]=value;
  cpNormalizeState();
  renderCompanyProfilesPage();
}
function selectCompanyProfile(id){companyProfileState.company=id;renderCompanyProfilesPage()}

function cpRevenueStats(profile){
  const rows=profile.financials?.revenueSeries||[];
  if(rows.length<2)return {latestGrowth:null,cagr:null};
  const first=Number(rows[0].value),last=Number(rows[rows.length-1].value),years=Math.max(1,Number(rows[rows.length-1].year)-Number(rows[0].year));
  const prev=Number(rows[rows.length-2].value);
  return {latestGrowth:prev?((last/prev-1)*100):null,cagr:first?((Math.pow(last/first,1/years)-1)*100):null};
}
function cpRevenueChart(profile){
  const f=profile.financials||{},rows=f.revenueSeries||[];
  if(rows.length<2)return '<div class="cp-no-series"><strong>Comparable trend series is not publicly disclosed</strong><p>'+esc(f.seriesNote||"The company does not publish a comparable multi-year standalone revenue series in the selected public sources.")+'</p></div>';
  const W=700,H=250,pL=46,pR=22,pT=30,pB=42,vals=rows.map(r=>Number(r.value)),min=Math.min(...vals)*.94,max=Math.max(...vals)*1.06;
  const x=i=>pL+i*(W-pL-pR)/(rows.length-1),y=v=>pT+(max-v)*(H-pT-pB)/(max-min||1),pts=rows.map((r,i)=>[x(i),y(Number(r.value))]);
  return '<div class="cp-revenue-chart"><svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Revenue trend">'+
    [0,1,2,3].map(i=>{const yy=pT+i*(H-pT-pB)/3;return '<line x1="'+pL+'" y1="'+yy+'" x2="'+(W-pR)+'" y2="'+yy+'" stroke="#e8edef"/>'}).join('')+
    '<polyline points="'+pts.map(p=>p.join(",")).join(" ")+'" fill="none" stroke="#003b5c" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>'+
    pts.map((pt,i)=>'<circle cx="'+pt[0]+'" cy="'+pt[1]+'" r="5" fill="#0076a8" stroke="#fff" stroke-width="2"/><text x="'+pt[0]+'" y="'+(pt[1]-10)+'" text-anchor="middle" font-size="11" font-weight="800" fill="#003b5c">'+rows[i].value.toFixed(2)+'</text><text x="'+pt[0]+'" y="'+(H-13)+'" text-anchor="middle" font-size="11" font-weight="700" fill="#6b7478">'+rows[i].year+'</text>').join('')+
    '</svg><div class="cp-chart-foot"><span>Currency: '+esc(f.currency||"Reported")+'</span><span>Company / group revenue unless specifically labeled otherwise.</span></div></div>';
}
function cpGrowthBars(profile){
  const rows=profile.financials?.revenueSeries||[];
  if(rows.length<2)return '<div class="cp-empty">Annual growth trend is unavailable because a comparable multi-year revenue series is not publicly disclosed.</div>';
  const growth=rows.slice(1).map((r,i)=>({year:r.year,value:(Number(r.value)/Number(rows[i].value)-1)*100}));
  const max=Math.max(1,...growth.map(x=>Math.abs(x.value)));
  return '<div class="cp-growth-bars">'+growth.map(x=>'<div class="cp-growth-row"><span>'+x.year+'</span><div><i class="'+(x.value<0?'negative':'')+'" style="width:'+Math.max(5,Math.abs(x.value)/max*100)+'%"></i></div><b class="'+(x.value<0?'negative':'')+'">'+(x.value>=0?'+':'')+x.value.toFixed(1)+'%</b></div>').join('')+'</div>';
}
function cpPortfolioChart(profile){
  const products=profile.products||[];
  const cats=cpUnique(products.map(x=>x.category));
  const rows=(cats.length?cats:(profile.portfolioTags||[]).slice(0,6)).slice(0,7).map((cat,i)=>{
    const prod=products.filter(p=>p.category===cat);
    const feat=prod.reduce((s,p)=>s+(p.features||[]).length,0);
    const score=Math.min(98,58+prod.length*10+feat*4+(i%3)*3);
    return {cat,score};
  });
  if(!rows.length)return '<div class="cp-empty">Portfolio categories are not loaded for this profile.</div>';
  return '<div class="cp-index-bars">'+rows.map(r=>'<div><span>'+esc(r.cat)+'</span><div class="cp-index-track"><i style="width:'+r.score+'%"></i></div><b>'+r.score+'</b></div>').join('')+'<p class="cp-chart-note">Illustrative portfolio-breadth index derived from the loaded product categories, representative platforms and feature depth; not market share.</p></div>';
}
function cpStrategyScore(profile,label){
  if(profile.demoIndexes&&profile.demoIndexes[label]!=null)return profile.demoIndexes[label];
  const text=JSON.stringify(profile.strategy||{}).toLowerCase();
  const keys={innovation:["innovation","new","platform","technology","assay","robot"],digital:["digital","data","cloud","ai","software","connected"],global:["global","international","country","region","geographic"],portfolio:["portfolio","menu","breadth","category","platform"],channel:["direct","distributor","pharmacy","channel","sales"],expansion:["expand","growth","acquisition","partnership","launch"]}[label]||[];
  return Math.min(94,62+keys.filter(k=>text.includes(k)).length*7);
}
function cpStrategyChart(profile){
  const labels=[["innovation","Innovation"],["digital","Digital"],["global","Global reach"],["portfolio","Portfolio breadth"],["channel","Channel strength"],["expansion","Expansion"]];
  return '<div class="cp-strategy-chart">'+labels.map(([k,l])=>{const v=cpStrategyScore(profile,k);return '<div><span>'+l+'</span><div class="cp-index-track"><i style="width:'+v+'%"></i></div><b>'+v+'</b></div>'}).join('')+'<p class="cp-chart-note">Directional analyst index for demo visualization; combines public strategy signals with loaded profile evidence and is not an external rating.</p></div>';
}
function cpRegionFootprintChart(profile){
  const all=["North America","Europe","Asia-Pacific","Latin America","Middle East & Africa"];
  const detailed=new Set((profile.regionalPortfolio||[]).map(x=>x.region)),present=new Set(profile.regions||[]);
  return '<div class="cp-region-bars">'+all.map(r=>{const score=detailed.has(r)?100:(present.has(r)?72:0);return '<div class="'+(companyProfileState.region===r?'active':'')+'"><span>'+r+'</span><div class="cp-index-track"><i style="width:'+score+'%"></i></div><b>'+score+'</b></div>'}).join('')+'<p class="cp-chart-note">Operating-footprint evidence index: 100 = detailed regional portfolio loaded; 72 = documented presence without detailed portfolio split; 0 = no current evidence in the profile.</p></div>';
}
function cpTimeline(items,emptyText){
  if(!items||!items.length)return '<div class="cp-empty">'+esc(emptyText||"No major publicly disclosed events loaded.")+'</div>';
  return '<div class="cp-timeline">'+items.map(x=>'<article><div class="cp-time-year">'+esc(x.year)+'</div><div><strong>'+esc(x.title)+'</strong>'+(x.type?'<span class="cp-event-type">'+esc(x.type)+'</span>':'')+'<p>'+esc(x.detail)+'</p></div></article>').join('')+'</div>';
}
function cpChipList(items,kind){
  if(!items||!items.length)return '<span class="cp-muted">Not separately disclosed.</span>';
  return '<div class="cp-chip-list '+(kind||'')+'">'+items.map(x=>'<span>'+esc(x)+'</span>').join('')+'</div>';
}
function cpStrategyGrid(strategy){
  const labels=[["business","Business strategy"],["product","Product strategy"],["channel","Channel strategy"],["geographic","Geographical strategy"],["digital","Digital strategy"],["rd","R&D strategy"],["expansion","Expansion strategy"]];
  return '<div class="cp-strategy-grid">'+labels.map(([k,l])=>'<article><span>'+l+'</span><p>'+esc(strategy?.[k]||"Not separately disclosed.")+'</p></article>').join('')+'</div>';
}
function cpProductMatches(p){
  if(companyProfileState.portfolio==="All Portfolio & Services")return true;
  const words=companyProfileState.portfolio.toLowerCase().split(/\s+/).filter(x=>x.length>3);
  const blob=(p.category+" "+p.name+" "+p.positioning+" "+(p.features||[]).join(" ")).toLowerCase();
  return words.some(w=>blob.includes(w));
}
function cpProducts(profile){
  let products=(profile.products||[]).filter(cpProductMatches);
  if(!products.length)products=profile.products||[];
  return '<div class="cp-products">'+products.map(p=>'<article><div class="cp-product-head"><span>'+esc(p.category)+'</span><strong>'+esc(p.name)+'</strong></div><div class="cp-product-grid"><div><b>USP / differentiated value</b><p>'+esc(p.usp)+'</p></div><div><b>Key features</b>'+cpChipList(p.features,'compact')+'</div><div><b>Claims / evidence positioning</b><p>'+esc(p.claims)+'</p></div><div><b>Market positioning</b><p>'+esc(p.positioning)+'</p></div></div></article>').join('')+'</div>';
}
function cpRegional(profile){
  const region=companyProfileState.region;
  const rows=(profile.regionalPortfolio||[]).filter(x=>region==="All Regions"||x.region===region);
  const websites=(profile.websites||[]).filter(x=>region==="All Regions"||x.region===region||x.region==="Global");
  return '<div class="grid-2"><div class="card"><div class="card-title"><h3>Regional websites & access points</h3><small>'+esc(region)+'</small></div><div class="cp-websites">'+(websites.length?websites.map(w=>'<a href="'+w.url+'" target="_blank" rel="noopener"><span>'+esc(w.region)+'</span><strong>'+esc(w.label)+'</strong><em>Open ↗</em></a>').join(''):'<div class="cp-empty">No dedicated regional website loaded for this selection; use the global company site.</div>')+'</div></div>'+
  '<div class="card"><div class="card-title"><h3>Regional product & service portfolio</h3><small>Selected geographic lens</small></div><div class="cp-regional">'+(rows.length?rows.map(r=>'<article><span>'+esc(r.region)+'</span>'+cpChipList(r.items,'compact')+'<p>'+esc(r.serviceModel)+'</p></article>').join(''):'<div class="cp-empty">No separate regional portfolio disclosure loaded for this selection. The broader company profile remains visible, but availability should be validated locally.</div>')+'</div></div></div>';
}
function cpSources(profile){return '<div class="source-list">'+(profile.sources||[]).map(s=>'<div class="source-item"><a href="'+s.url+'" target="_blank" rel="noopener">'+esc(s.label)+' ↗</a></div>').join('')+'</div>'}
function cpLensBanner(profile){
  const vals=[
    companyProfileState.region!=="All Regions"?"Region: "+companyProfileState.region:null,
    companyProfileState.portfolio!=="All Portfolio & Services"?"Portfolio: "+companyProfileState.portfolio:null,
    companyProfileState.focus!=="All Focus Areas"?"Focus: "+companyProfileState.focus:null
  ].filter(Boolean);
  if(!vals.length)return '';
  return '<div class="cp-lens-banner"><strong>Active analysis lens</strong><div>'+vals.map(x=>'<span>'+esc(x)+'</span>').join('')+'</div><p>Profile sections below are scoped to the selected filters wherever regional or portfolio-level evidence is available.</p></div>';
}
function cpCompetitiveSynthesis(profile){
  const watch=(profile.riskWatchpoints&&profile.riskWatchpoints.length)?profile.riskWatchpoints:(profile.financials?.latestInsights||[]).slice(-2);
  const activeFocus=companyProfileState.focus==="All Focus Areas"?(profile.focusTags||[])[0]:companyProfileState.focus;
  return '<div class="cp-synthesis-grid">'+
    '<article><span>Competitive edge</span><strong>'+esc((profile.usps||[]).slice(0,2).join(" + ")||"Differentiated portfolio")+'</strong><p>'+esc((profile.usps||[]).slice(2).join(", ")||profile.strategy?.product||"See product portfolio for differentiation.")+'</p></article>'+
    '<article><span>Selected focus</span><strong>'+esc(activeFocus||"Enterprise strategy")+'</strong><p>'+esc(profile.strategy?.business||profile.overview)+'</p></article>'+
    '<article><span>Growth agenda</span><strong>Expansion & innovation</strong><p>'+esc(profile.strategy?.expansion||profile.initiatives?.[0]?.detail||"Growth agenda should be validated from current company guidance.")+'</p></article>'+
    '<article class="watch"><span>Watchpoints</span><strong>'+esc(watch[0]||"Execution and market access")+'</strong><p>'+esc(watch.slice(1).join("; ")||"Monitor regulatory, reimbursement, competitive and execution signals.")+'</p></article>'+
  '</div>';
}

function renderCompanyProfilesPage(){
  cpNormalizeState();
  const profiles=companyProfileData();
  if(!profiles.length){$('pageContent').innerHTML='<div class="empty-search">No company-profile research is loaded for '+esc(currentDomain)+'.</div>';return}
  const regionVals=cpAvailableValues("region"),portfolioVals=cpAvailableValues("portfolio"),focusVals=cpAvailableValues("focus"),candidates=cpCurrentCandidates();
  let profile=profiles.find(p=>p.id===companyProfileState.company)||candidates[0]||profiles[0];
  companyProfileState.company=profile.id;
  const f=profile.financials||{},stats=cpRevenueStats(profile);

  $('breadcrumbSmall').textContent='Competitive Intelligence / Company Profiles';
  $('breadcrumbTitle').textContent=currentDomain+' — '+profile.name;

  $('pageContent').innerHTML=
    '<div class="page-head cp-page-head"><div class="title-wrap"><div class="breadcrumb"><button onclick="navigate(\'executive\')">Executive Hub</button> / <button onclick="openSegment(\'ci\')">Competitive Intelligence</button> / Company Profiles</div><h1>Company Profiles</h1><p>Comprehensive competitor intelligence for <b>'+esc(currentDomain)+'</b>, integrating company fundamentals, financial trendlines, regional operations, portfolio architecture, technology, strategy, M&A and execution signals.</p></div></div>'+
    '<section class="cp-filter-shell"><div class="cp-filter"><label>Company<select onchange="updateCompanyProfileFilter(\'company\',this.value)">'+candidates.map(p=>'<option value="'+esc(p.id)+'" '+(p.id===profile.id?'selected':'')+'>'+esc(p.name)+'</option>').join('')+'</select></label></div>'+
    '<div class="cp-filter"><label>Region<select onchange="updateCompanyProfileFilter(\'region\',this.value)">'+cpOptions(["All Regions",...regionVals],companyProfileState.region)+'</select></label></div>'+
    '<div class="cp-filter"><label>Portfolio & Services<select onchange="updateCompanyProfileFilter(\'portfolio\',this.value)">'+cpOptions(["All Portfolio & Services",...portfolioVals],companyProfileState.portfolio)+'</select></label></div>'+
    '<div class="cp-filter"><label>Focus of Company<select onchange="updateCompanyProfileFilter(\'focus\',this.value)">'+cpOptions(["All Focus Areas",...focusVals],companyProfileState.focus)+'</select></label></div></section>'+
    cpLensBanner(profile)+

    '<section class="cp-company-hero"><div class="cp-company-title">'+cpCompanyLogo(profile.name,'large')+'<div><span>'+esc(currentDomain)+'</span><h2>'+esc(profile.name)+'</h2><p>'+esc(profile.overview)+'</p></div></div><div class="cp-meta-grid">'+
      '<div><span>Headquarters</span><strong>'+esc(profile.hq)+'</strong></div><div><span>Founded</span><strong>'+esc(profile.founded)+'</strong></div><div><span>Company type</span><strong>'+esc(profile.type)+'</strong></div><div><span>Employees</span><strong>'+esc(profile.employees)+'</strong></div></div>'+
      '<div class="cp-presence"><span>Geographical presence</span><p>'+esc(profile.presence)+'</p>'+cpChipList(profile.regions,'regions')+'</div></section>'+

    '<section class="section"><div class="cp-quick-kpis">'+
      '<article><span>Latest revenue</span><strong>'+esc(f.latestRevenue||"Not disclosed")+'</strong><small>'+esc(f.currency||"")+'</small></article>'+
      '<article><span>Latest YoY growth</span><strong>'+(stats.latestGrowth==null?'N/A':((stats.latestGrowth>=0?'+':'')+stats.latestGrowth.toFixed(1)+'%'))+'</strong><small>Derived from loaded revenue series</small></article>'+
      '<article><span>Revenue CAGR</span><strong>'+(stats.cagr==null?'N/A':((stats.cagr>=0?'+':'')+stats.cagr.toFixed(1)+'%'))+'</strong><small>First-to-latest reported year</small></article>'+
      '<article><span>Markets covered</span><strong>'+((profile.regions||[]).length)+'</strong><small>Regional presence categories</small></article>'+
      '<article><span>Representative platforms</span><strong>'+((profile.products||[]).length)+'</strong><small>Detailed product groups loaded</small></article>'+
      '<article><span>Strategic events</span><strong>'+((profile.deals||[]).length+(profile.initiatives||[]).length)+'</strong><small>M&A, partnerships & initiatives</small></article>'+
    '</div></section>'+

    '<section class="section"><div class="section-head"><div><h2>Financial performance & momentum</h2><p>Publicly reported company / segment metrics, with derived growth indicators and clear disclosure where standalone data is unavailable.</p></div><span class="cp-data-note">Public filings / company reporting</span></div>'+
      '<div class="grid-2"><div class="card cp-fin-chart"><div class="card-title"><h3>Revenue trendline</h3><small>Up to five reported years</small></div>'+cpRevenueChart(profile)+'</div><div class="card"><div class="card-title"><h3>Annual revenue growth</h3><small>Derived from reported series</small></div>'+cpGrowthBars(profile)+'</div></div>'+
      '<div class="grid-2 cp-fin-detail-row"><div class="card cp-fin-block"><div class="card-title"><h3>Business unit / segment revenue</h3><small>Latest disclosed mix</small></div>'+cpChipList(f.buRevenue,'financial')+'</div><div class="card cp-fin-block"><div class="card-title"><h3>Country / zone-specific revenue</h3><small>Where publicly available</small></div>'+cpChipList(f.regionalRevenue,'financial')+'</div></div>'+
      '<div class="card cp-insight-card"><div class="card-title"><h3>Latest financial-result takeaways</h3><small>Strategic read-through</small></div><div class="cp-insight-list">'+(f.latestInsights||[]).map((x,i)=>'<article><span>0'+(i+1)+'</span><p>'+esc(x)+'</p></article>').join('')+'</div></div>'+
    '</section>'+

    '<section class="section"><div class="section-head"><div><h2>Portfolio architecture & competitive positioning</h2><p>Representative products, differentiated value, features, company claims and positioning under the selected portfolio lens.</p></div><span class="cp-data-note">'+esc(companyProfileState.portfolio)+'</span></div>'+
      '<div class="grid-2"><div class="card"><div class="card-title"><h3>Portfolio breadth index</h3><small>Illustrative analytical view</small></div>'+cpPortfolioChart(profile)+'</div><div class="card"><div class="card-title"><h3>Competitive synthesis</h3><small>Decision-oriented interpretation</small></div>'+cpCompetitiveSynthesis(profile)+'</div></div>'+
      '<div class="cp-product-section">'+cpProducts(profile)+'</div></section>'+

    '<section class="section"><div class="section-head"><div><h2>Regional footprint & go-to-market</h2><p>Website access, documented regional portfolio, operating presence and delivery model for the selected geography.</p></div></div>'+
      '<div class="grid-2"><div class="card"><div class="card-title"><h3>Regional operating-footprint evidence</h3><small>'+esc(companyProfileState.region)+'</small></div>'+cpRegionFootprintChart(profile)+'</div><div class="card"><div class="card-title"><h3>Business model & market access</h3><small>Customers, manufacturing and access</small></div><div class="cp-operating-model"><div><b>Priority customers</b>'+cpChipList(profile.customerGroups||["Hospital / clinical customers","Professional users"],'compact')+'</div><div><b>Manufacturing / operating model</b><p>'+esc(profile.manufacturing||profile.presence)+'</p></div><div><b>Market-access model</b><p>'+esc(profile.marketAccess||profile.strategy?.channel||"Direct and/or distributor commercialization depending on geography.")+'</p></div></div></div></div>'+
      cpRegional(profile)+'</section>'+

    '<section class="section"><div class="section-head"><div><h2>Strategic direction & capability emphasis</h2><p>How the company is allocating attention across innovation, digital, geographic expansion, channel strength and portfolio breadth.</p></div></div>'+
      '<div class="grid-2"><div class="card"><div class="card-title"><h3>Directional strategy emphasis</h3><small>Analyst index for demo visualization</small></div>'+cpStrategyChart(profile)+'</div><div class="card"><div class="card-title"><h3>Technology, USP, devices & tests</h3><small>Competitive differentiation</small></div><div class="cp-tech-block"><b>Core technologies</b>'+cpChipList(profile.technology,'tech')+'<b>Competitive USPs</b>'+cpChipList(profile.usps,'usp')+'<b>Key devices / tests / services</b>'+cpChipList(profile.devicesTests,'devices')+'</div></div></div>'+
      '<div class="card cp-strategy-card"><div class="card-title"><h3>Current strategy</h3><small>Business, product, channel, geography, digital, R&D and expansion</small></div>'+cpStrategyGrid(profile.strategy)+'</div></section>'+

    '<section class="section"><div class="grid-2"><div class="card"><div class="card-title"><h3>Key transformations over time</h3><small>Business-model and portfolio evolution</small></div>'+cpTimeline(profile.transformations,'No transformation timeline loaded.')+'</div><div class="card"><div class="card-title"><h3>M&A & partnership timeline</h3><small>Selected strategic transactions</small></div>'+cpTimeline(profile.deals,'No material domain-relevant transaction is loaded in the current public-source snapshot.')+'</div></div>'+
      '<div class="grid-2 cp-timeline-row"><div class="card"><div class="card-title"><h3>Key initiatives</h3><small>Recent execution priorities</small></div>'+cpTimeline(profile.initiatives,'No initiative timeline loaded.')+'</div><div class="card"><div class="card-title"><h3>Risk & monitoring agenda</h3><small>Signals to track</small></div><div class="cp-risk-list">'+(profile.riskWatchpoints||["Regulatory / reimbursement changes","Competitive launches","Execution against current strategy"]).map((x,i)=>'<article><span>'+String(i+1).padStart(2,"0")+'</span><p>'+esc(x)+'</p></article>').join('')+'</div></div></div></section>'+

    '<section class="section"><div class="grid-2"><div class="card"><div class="card-title"><h3>Source basis</h3><small>Official filings and company materials</small></div>'+cpSources(profile)+'</div><div class="card"><div class="card-title"><h3>Evidence governance</h3><small>How to interpret the profile</small></div><div class="deliverable-list"><div class="deliverable-item"><div class="qnum">1</div><span>Financial values use public filings / company releases where available; private-company and nonprofit gaps remain explicitly undisclosed rather than silently fabricated.</span></div><div class="deliverable-item"><div class="qnum">2</div><span>Product claims are reported as company positioning unless independently substantiated; verify regulatory labels and clinical evidence before external use.</span></div><div class="deliverable-item"><div class="qnum">3</div><span>Portfolio-breadth and strategy-emphasis scores are illustrative analyst indices for dashboard demonstration only, not external ratings or market-share estimates.</span></div><div class="deliverable-item"><div class="qnum">4</div><span>Regional availability varies by approval, reimbursement and commercialization status; the filters dynamically scope the evidence loaded into this prototype.</span></div></div></div></div></section>';
}