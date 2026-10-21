/* CI Intelligence v2 — richer analytics, one-year trend views and cascading filter behavior */

function ci2MonthRows(news){
  const months=[];
  for(let i=11;i>=0;i--){
    const d=new Date("2026-09-18T00:00:00");d.setMonth(d.getMonth()-i);
    const key=d.toISOString().slice(0,7);months.push({key,label:d.toLocaleString("en",{month:"short"})+" '"+String(d.getFullYear()).slice(2)});
  }
  return months.map(m=>({label:m.label,value:news.filter(n=>n.date&&n.date.slice(0,7)===m.key).length,key:m.key}));
}
function ci2Quarter(date){
  const d=ciDateVal(date),q=Math.floor(d.getMonth()/3)+1;return d.getFullYear()+" Q"+q;
}
function ci2Priority(n){
  if(["Regulatory Milestone","Clinical Trial Update","M&A"].includes(n.milestone))return "High";
  if(["Partnership","Executive Movement","Organizational Update"].includes(n.milestone))return "Medium";
  if(["Clinical, R&D","Partnership, M&A"].includes(ciTheme(n)))return "Medium";
  return "Routine";
}
function ci2Authority(n){
  if(/FDA|regulatory authority/i.test(n.sourceType||""))return "Regulator";
  if(/Company/.test(n.sourceType||""))return "Company primary";
  if(/PRNewswire|GlobeNewswire|BusinessWire/i.test((n.source||"")+" "+(n.sourceType||"")))return "Distribution wire";
  return "Other reputable";
}
function ci2Kpis(items){
  return '<div class="ci2-kpis">'+items.map(x=>'<article><span>'+esc(x.label)+'</span><strong>'+esc(String(x.value))+'</strong><small>'+esc(x.note||"")+'</small></article>').join('')+'</div>';
}
function ci2Heatmap(rowLabels,colLabels,getValue,note){
  if(!rowLabels.length||!colLabels.length)return '<div class="ci-empty">No matrix data under the current filters.</div>';
  const vals=[];rowLabels.forEach(r=>colLabels.forEach(c=>vals.push(getValue(r,c)||0)));const max=Math.max(...vals,1);
  return '<div class="table-scroll"><table class="data-table ci2-heat"><thead><tr><th></th>'+colLabels.map(c=>'<th>'+esc(c)+'</th>').join('')+'</tr></thead><tbody>'+
    rowLabels.map(r=>'<tr><td><strong>'+esc(r)+'</strong></td>'+colLabels.map(c=>{const v=getValue(r,c)||0,a=.08+.54*(v/max);return '<td><span style="background:rgba(0,163,224,'+a.toFixed(2)+')">'+v+'</span></td>'}).join('')+'</tr>').join('')+
    '</tbody></table></div>'+(note?'<p class="ci-chart-note">'+esc(note)+'</p>':'');
}
function ci2SourceMix(news){
  const groups=["Regulator","Company primary","Distribution wire","Other reputable"].map(x=>({label:x,value:news.filter(n=>ci2Authority(n)===x).length})).filter(x=>x.value);
  return ciDonut(groups);
}
function ci2PriorityMix(news){
  return ciDonut(["High","Medium","Routine"].map(x=>({label:x,value:news.filter(n=>ci2Priority(n)===x).length})).filter(x=>x.value));
}
function ci2Momentum(news){
  const cutNow=new Date("2026-06-19T00:00:00"),cutPrev=new Date("2026-03-20T00:00:00");
  const now=news.filter(n=>ciDateVal(n.date)>=cutNow).length;
  const prev=news.filter(n=>ciDateVal(n.date)>=cutPrev&&ciDateVal(n.date)<cutNow).length;
  if(!prev)return now?"+100%":"0%";
  const v=(now/prev-1)*100;return (v>=0?"+":"")+Math.round(v)+"%";
}
function ci2NewsSummary(news){
  if(!news.length)return '<div class="ci-empty">No items match the current filters. Broaden Company, Theme, Time Period, Source or Priority.</div>';
  const themes={};news.forEach(n=>themes[ciTheme(n)]=(themes[ciTheme(n)]||0)+1);
  const top=Object.entries(themes).sort((a,b)=>b[1]-a[1]).slice(0,3);
  const latest=news.slice().sort((a,b)=>ciDateVal(b.date)-ciDateVal(a.date))[0];
  const high=news.filter(n=>ci2Priority(n)==="High").length;
  return '<div class="ci2-exec-summary"><div><span>What changed</span><p>'+esc(latest.company)+' most recently signaled <b>'+esc(latest.title)+'</b>. Across the selected set, '+news.length+' relevant developments were captured.</p></div>'+
    '<div><span>Where activity clusters</span><p>'+top.map(x=>'<b>'+esc(x[0])+'</b> ('+x[1]+')').join(", ")+' are the leading themes, indicating where competitive attention is currently concentrated.</p></div>'+
    '<div><span>Decision relevance</span><p>'+high+' high-priority milestones require closer follow-up because they relate to regulatory access, clinical evidence or transactions that can change competitive position.</p></div></div>';
}

/* NEWS & ALERTS V2 */
function ciFilteredNews(){
  const s=ciIntelState["news-alerts"],cut=ciPeriodCutoff(s.period),priority=s.priority||"All priorities";
  return ciSyntheticNews().filter(n=>{
    if(ciDateVal(n.date)<cut)return false;
    if(s.company!=="All companies"&&n.company!==s.company)return false;
    if(s.theme!=="All themes"&&ciTheme(n)!==s.theme)return false;
    if(s.source!=="All sources"&&n.sourceType!==s.source)return false;
    if(priority!=="All priorities"&&ci2Priority(n)!==priority)return false;
    return true;
  });
}
function renderNewsAlertsPage(){
  const s=ciIntelState["news-alerts"];if(!s.priority)s.priority="All priorities";
  const all=ciSyntheticNews(),companies=ciUnique(all.map(x=>x.company)),sources=ciUnique(all.map(x=>x.sourceType)),news=ciFilteredNews();
  const byCompany=ciUnique(news.map(x=>x.company)).map(c=>({label:c,value:news.filter(n=>n.company===c).length})).sort((a,b)=>b.value-a.value);
  const byTheme=CI_NEWS_THEMES.slice(1).map(t=>({label:t,value:news.filter(n=>ciTheme(n)===t).length})).filter(x=>x.value);
  const months=ci2MonthRows(news);
  const activeCompanies=ciUnique(news.map(x=>x.company)),activeThemes=ciUnique(news.map(ciTheme));
  $('breadcrumbSmall').textContent='Competitive Intelligence / News & Alerts';$('breadcrumbTitle').textContent=currentDomain+' — News & Alerts';
  $('pageContent').innerHTML=ciPageHead("News & Alerts",'One-year competitive signal monitoring for <b>'+esc(currentDomain)+'</b>, with source-linked company news, regulatory / clinical milestones, transaction activity, leadership changes and product developments. Market-share and stock-price news are excluded.')+
    '<section class="ci-filter-shell five">'+
      ciFilterSelect("Company","company",["All companies",...companies],s.company,"news-alerts")+
      ciFilterSelect("Themes","theme",CI_NEWS_THEMES,s.theme,"news-alerts")+
      ciFilterSelect("Time Period","period",["30 days","90 days","6 months","1 year","All periods"],s.period,"news-alerts")+
      ciFilterSelect("Source type","source",["All sources",...sources],s.source,"news-alerts")+
      ciFilterSelect("Priority","priority",["All priorities","High","Medium","Routine"],s.priority,"news-alerts")+
    '</section>'+
    '<section class="section">'+ci2Kpis([
      {label:"Selected news",value:news.length,note:"Curated relevant records"},
      {label:"Companies active",value:activeCompanies.length,note:"Under current filters"},
      {label:"High-priority signals",value:news.filter(n=>ci2Priority(n)==="High").length,note:"Regulatory / clinical / M&A"},
      {label:"Source diversity",value:ciUnique(news.map(ci2Authority)).length,note:"Authority categories"},
      {label:"3-month momentum",value:ci2Momentum(news),note:"Recent vs prior 90 days"},
      {label:"Latest signal",value:news[0]?.date||"N/A",note:news[0]?.company||""}
    ])+'</section>'+
    '<section class="section">'+ciSectionTitle("Executive signal summary","Concise interpretation of the selected news set, with observed facts separated from prioritization.","Dynamic selection")+ci2NewsSummary(news)+'</section>'+
    '<section class="section"><div class="grid-3"><div class="card"><div class="card-title"><h3>News volume by company</h3><small>Filtered set</small></div>'+ciHorizontalBars(byCompany)+'</div><div class="card"><div class="card-title"><h3>12-month news velocity</h3><small>Monthly volume</small></div>'+ciLineChart(months,"label","value")+'</div><div class="card"><div class="card-title"><h3>Theme mix</h3><small>What competitors are talking about</small></div>'+ciDonut(byTheme)+'</div></div></section>'+
    '<section class="section"><div class="grid-3"><div class="card"><div class="card-title"><h3>Priority distribution</h3><small>Signal triage</small></div>'+ci2PriorityMix(news)+'</div><div class="card"><div class="card-title"><h3>Source-authority mix</h3><small>Evidence provenance</small></div>'+ci2SourceMix(news)+'</div><div class="card"><div class="card-title"><h3>Company × theme heatmap</h3><small>Concentration of activity</small></div>'+ci2Heatmap(activeCompanies.slice(0,8),activeThemes,(c,t)=>news.filter(n=>n.company===c&&ciTheme(n)===t).length)+'</div></div></section>'+
    '<section class="section">'+ciSectionTitle("Regulatory, clinical & executive milestone timeline","High-consequence events that may affect product access, evidence, organizational direction or competitive execution.","Last year")+ '<div class="card">'+ciNewsMilestones(news)+'</div></section>'+
    '<section class="section">'+ciSectionTitle("Detailed news feed","Newest items first. Each record retains company, taxonomy, source type, summary and exact source link.","Curated primary / reputable sources")+ciNewsFeed(news)+'</section>'+
    '<section class="section"><div class="research-note"><strong>Coverage governance:</strong> this dashboard uses a curated one-year intelligence set from company newsrooms, regulatory sources and reputable distribution channels. It is comprehensive for the prototype but should not be interpreted as a guaranteed exhaustive capture of every public mention. Demo reporting-cycle items are explicitly tagged.</div></section>';
}

/* PRODUCT BENCHMARKING V2 */
function ci2FeatureDimensions(lens){
  const all=["Automation / workflow","Technology differentiation","Digital connectivity","Clinical evidence","Ease of use","Interoperability","Regional availability","Portfolio breadth","Service / support"];
  const map={
    "Features":["Automation / workflow","Ease of use","Service / support","Portfolio breadth"],
    "Technology":["Technology differentiation","Automation / workflow","Interoperability"],
    "Digital":["Digital connectivity","Interoperability","Automation / workflow"],
    "Regional reach":["Regional availability","Service / support","Portfolio breadth"],
    "Evidence":["Clinical evidence","Technology differentiation","Service / support"]
  };
  return map[lens]||all;
}
function ci2FeatureScore(p,dim,category,region){
  const blob=JSON.stringify(p).toLowerCase(),products=(p.products||[]).filter(x=>category==="All categories"||x.category===category),regional=(p.regions||[]).includes(region)||region==="All Regions";
  const keys={
    "Automation / workflow":["automation","workflow","robot","automated","throughput"],
    "Technology differentiation":["technology","sensor","robot","optical","molecular","assay","implant","algorithm","platform"],
    "Digital connectivity":["digital","cloud","app","connected","software","data"],
    "Clinical evidence":["clinical","evidence","trial","study","outcomes"],
    "Ease of use":["easy","simple","compact","workflow","patient-friendly","tubeless"],
    "Interoperability":["integrat","compatible","interoper","platform"],
    "Regional availability":["global","country","region","international"],
    "Portfolio breadth":["portfolio","menu","broad","category","platform"],
    "Service / support":["service","support","education","training","advisory"]
  };
  let score=52+(ciHash(p.name+dim)%13)+keys[dim].filter(k=>blob.includes(k)).length*7+Math.min(products.length,4)*3;
  if(dim==="Regional availability")score+=(p.regions||[]).length*4+(regional?8:-10);
  return ciPct(score);
}
function ci2QuarterSignals(company){
  const news=ciSyntheticNews().filter(n=>n.company===company&&ciDateVal(n.date)>=new Date("2025-09-18T00:00:00")&&["Product & Services","Clinical, R&D"].includes(ciTheme(n)));
  const qs=["2025 Q4","2026 Q1","2026 Q2","2026 Q3"];
  return qs.map(q=>({label:q,value:news.filter(n=>ci2Quarter(n.date)===q).length}));
}
function ci2RegionalMatrix(profiles,regions){
  return ci2Heatmap(profiles.map(p=>p.name),regions,(name,r)=>{
    const p=profiles.find(x=>x.name===name);if(!(p.regions||[]).includes(r))return 0;
    return (p.regionalPortfolio||[]).some(x=>x.region===r)?2:1;
  },"2 = detailed regional portfolio evidence; 1 = documented presence; 0 = no loaded presence.");
}
function ci2ProductOpportunity(a,b,category,region){
  const scoresA=ciBenchmarkScores(a,region,category),scoresB=ciBenchmarkScores(b,region,category);
  const diffs=Object.keys(scoresA).map(k=>({k,d:scoresA[k]-scoresB[k]})).sort((x,y)=>Math.abs(y.d)-Math.abs(x.d));
  return '<div class="ci2-opportunity-cards">'+diffs.slice(0,4).map(x=>'<article><span>'+esc(x.k)+'</span><strong>'+esc(x.d===0?"Parity":Math.abs(x.d)+"-pt gap")+'</strong><p>'+esc(x.d>0?a.name+" shows stronger directional evidence under this lens.":x.d<0?b.name+" shows stronger directional evidence under this lens.":"Loaded evidence is broadly balanced.")+'</p></article>').join('')+'</div>';
}
function renderProductPortfolioPage(){
  const s=ciIntelState["product-portfolio"],names=ciNames(),profiles=ciProfiles();if(!names.includes(s.companyA))s.companyA=names[0]||"";if(!names.includes(s.companyB)||s.companyB===s.companyA)s.companyB=names.find(n=>n!==s.companyA)||s.companyA;
  const a=ciProfileByName(s.companyA),b=ciProfileByName(s.companyB),regions=ciUnique(profiles.flatMap(p=>p.regions||[])),cats=ciProductCategories(),dims=ci2FeatureDimensions(s.lens);
  const scoreRows=dims.map(d=>({label:d,value:Math.round((ci2FeatureScore(a,d,s.category,s.region)+ci2FeatureScore(b,d,s.category,s.region))/2)}));
  $('breadcrumbSmall').textContent='Competitive Intelligence / Product & Portfolio Benchmarking';$('breadcrumbTitle').textContent=currentDomain+' — Product Benchmarking';
  $('pageContent').innerHTML=ciPageHead("Product & Portfolio Benchmarking",'Multi-dimensional benchmarking of representative competitor portfolios in <b>'+esc(currentDomain)+'</b>, combining product attributes, workflow fit, technology, evidence, regional availability and recent innovation signals.')+
    '<section class="ci-filter-shell five">'+ciFilterSelect("Company A","companyA",names,s.companyA,"product-portfolio")+ciFilterSelect("Company B","companyB",names,s.companyB,"product-portfolio")+ciFilterSelect("Category","category",["All categories",...cats],s.category,"product-portfolio")+ciFilterSelect("Region","region",["All Regions",...regions],s.region,"product-portfolio")+ciFilterSelect("Benchmark lens","lens",["Overall benchmark","Features","Technology","Digital","Regional reach","Evidence"],s.lens,"product-portfolio")+'</section>'+
    '<section class="section ci-company-visual-section"><div class="ci-company-visual-strip"><article>'+(typeof cpCompanyLogo==="function"?cpCompanyLogo(a.name,"large"):"")+'<div><span>Company A</span><strong>'+esc(a.name)+'</strong><small>'+esc((a.focusTags||[]).slice(0,3).join(" · "))+'</small></div></article><div class="ci-compare-vs">vs</div><article>'+(typeof cpCompanyLogo==="function"?cpCompanyLogo(b.name,"large"):"")+'<div><span>Company B</span><strong>'+esc(b.name)+'</strong><small>'+esc((b.focusTags||[]).slice(0,3).join(" · "))+'</small></div></article></div></section>'+
    '<section class="section">'+ci2Kpis([
      {label:"Company A platforms",value:(a.products||[]).length,note:a.name},
      {label:"Company B platforms",value:(b.products||[]).length,note:b.name},
      {label:"Shared categories",value:[...new Set((a.products||[]).map(x=>x.category))].filter(x=>(b.products||[]).some(y=>y.category===x)).length,note:"Loaded portfolio"},
      {label:"A innovation signals",value:ci2QuarterSignals(a.name).reduce((s,x)=>s+x.value,0),note:"Product + clinical news"},
      {label:"B innovation signals",value:ci2QuarterSignals(b.name).reduce((s,x)=>s+x.value,0),note:"Product + clinical news"},
      {label:"Region lens",value:s.region,note:s.category}
    ])+'</section>'+
    '<section class="section"><div class="grid-2"><div class="card"><div class="card-title"><h3>Capability benchmark</h3><small>Directional 0–100 index</small></div>'+ciBenchmarkMatrix(a,b,s.region,s.category)+'</div><div class="card"><div class="card-title"><h3>Portfolio gap / overlap</h3><small>Category whitespace</small></div>'+ciPortfolioGaps(a,b,s.category)+ci2ProductOpportunity(a,b,s.category,s.region)+'</div></div></section>'+
    '<section class="section"><div class="grid-3"><div class="card"><div class="card-title"><h3>'+esc(a.name)+' innovation flow</h3><small>Product + clinical signals</small></div>'+ciLineChart(ci2QuarterSignals(a.name),"label","value")+'</div><div class="card"><div class="card-title"><h3>'+esc(b.name)+' innovation flow</h3><small>Product + clinical signals</small></div>'+ciLineChart(ci2QuarterSignals(b.name),"label","value")+'</div><div class="card"><div class="card-title"><h3>Benchmark dimension intensity</h3><small>Combined directional evidence</small></div>'+ciHorizontalBars(scoreRows,100)+'</div></div></section>'+
    '<section class="section">'+ciSectionTitle("Feature / capability heatmap","Compares loaded public evidence on workflow, digital integration, clinical evidence, usability, interoperability, reach, breadth and support.","Directional analyst index")+
      '<div class="card">'+ci2Heatmap([a.name,b.name],dims,(name,d)=>ci2FeatureScore(name===a.name?a:b,d,s.category,s.region),"Scores are derived from loaded public product / strategy evidence and are not external ratings.")+'</div></section>'+
    '<section class="section">'+ciSectionTitle("Regional portfolio footprint","Shows where each competitor has documented presence versus detailed product / service evidence.","Dynamic region lens")+'<div class="card">'+ci2RegionalMatrix([a,b],regions)+'</div></section>'+
    '<section class="section">'+ciSectionTitle("Product-level evidence table","Representative platforms, USP, features, positioning and regional lens.","Company materials")+'<div class="card">'+ciProductTable(a,s.category,s.region)+ciProductTable(b,s.category,s.region)+'</div></section>';
}

/* M&A V2 */
function ci2DealQuarterRows(rows){
  const qs=["2025 Q4","2026 Q1","2026 Q2","2026 Q3"];return qs.map(q=>({label:q,value:rows.filter(x=>ci2Quarter(x.date)===q).length}));
}
function ci2DealComplexity(x){
  let v=55;if(x.type==="M&A")v+=22;if(x.type==="Transformation")v+=18;if(x.rationale==="Technology / Digital")v+=8;if(x.rationale==="Geographic / Network")v+=6;return ciPct(v);
}
function renderMAPage(){
  const s=ciIntelState["ma-partnerships"],all=ciDealEvents(),rows=ciFilteredDeals(),types=ciUnique(all.map(x=>x.type)),rats=ciUnique(all.map(x=>x.rationale)),companies=ciUnique(all.map(x=>x.company)),quarters=ci2DealQuarterRows(rows);
  const byCompany=companies.map(c=>({label:c,value:rows.filter(x=>x.company===c).length})).filter(x=>x.value).sort((a,b)=>b.value-a.value),byType=types.map(t=>({label:t,value:rows.filter(x=>x.type===t).length})).filter(x=>x.value),byRat=rats.map(t=>({label:t,value:rows.filter(x=>x.rationale===t).length})).filter(x=>x.value);
  const dominant=byRat.sort((a,b)=>b.value-a.value)[0]?.label||"N/A";
  $('breadcrumbSmall').textContent='Competitive Intelligence / M&A Partnerships & Investment';$('breadcrumbTitle').textContent=currentDomain+' — M&A & Partnerships';
  $('pageContent').innerHTML=ciPageHead("M&A Partnerships & Investment",'A transaction-intelligence view of how competitors in <b>'+esc(currentDomain)+'</b> buy, partner, license, distribute or invest to close capability gaps and accelerate strategic priorities.')+
    '<section class="ci-filter-shell">'+ciFilterSelect("Company","company",["All companies",...companies],s.company,"ma-partnerships")+ciFilterSelect("Deal type","type",["All deal types",...types],s.type,"ma-partnerships")+ciFilterSelect("Time period","period",["1 year","3 years","All periods"],s.period,"ma-partnerships")+ciFilterSelect("Strategic rationale","rationale",["All rationales",...rats],s.rationale,"ma-partnerships")+'</section>'+
    '<section class="section">'+ci2Kpis([
      {label:"Selected transactions",value:rows.length,note:"M&A + partnerships + investments"},
      {label:"Active companies",value:ciUnique(rows.map(x=>x.company)).length,note:"Under current filters"},
      {label:"M&A transactions",value:rows.filter(x=>x.type==="M&A").length,note:"Ownership-changing moves"},
      {label:"Partnership / licensing",value:rows.filter(x=>/Partnership|Distribution/.test(x.type)).length,note:"Asset-light capability building"},
      {label:"Dominant rationale",value:dominant,note:"Most common strategic intent"},
      {label:"High integration complexity",value:rows.filter(x=>ci2DealComplexity(x)>=75).length,note:"Illustrative watchlist"}
    ])+'</section>'+
    '<section class="section"><div class="grid-3"><div class="card"><div class="card-title"><h3>Deal activity by company</h3></div>'+ciHorizontalBars(byCompany)+'</div><div class="card"><div class="card-title"><h3>Quarterly transaction velocity</h3><small>Last four quarters</small></div>'+ciLineChart(quarters,"label","value")+'</div><div class="card"><div class="card-title"><h3>Deal structure</h3></div>'+ciDonut(byType)+'</div></div></section>'+
    '<section class="section"><div class="grid-2"><div class="card"><div class="card-title"><h3>Strategic rationale mix</h3></div>'+ciDonut(byRat)+'</div><div class="card"><div class="card-title"><h3>Company × rationale heatmap</h3><small>Where capability building is concentrated</small></div>'+ci2Heatmap(ciUnique(rows.map(x=>x.company)).slice(0,8),ciUnique(rows.map(x=>x.rationale)),(c,r)=>rows.filter(x=>x.company===c&&x.rationale===r).length)+'</div></div></section>'+
    '<section class="section">'+ciSectionTitle("Transaction implication map","Integration complexity is a demo index used to prioritize monitoring—not a judgment on transaction quality.","Observed event + analyst interpretation")+
      '<div class="table-scroll"><table class="data-table"><thead><tr><th>Date</th><th>Company</th><th>Structure</th><th>Rationale</th><th>Integration complexity</th><th>Strategic implication</th></tr></thead><tbody>'+rows.map(x=>'<tr><td>'+esc(x.date)+'</td><td><strong>'+esc(x.company)+'</strong></td><td>'+esc(x.type)+'</td><td>'+esc(x.rationale)+'</td><td><span class="ci2-score">'+ci2DealComplexity(x)+'</span></td><td>'+esc(ciDealImplication(x))+'</td></tr>').join('')+'</tbody></table></div></section>'+
    '<section class="section">'+ciSectionTitle("Transaction & partnership timeline","Newest events first, with source link and implication.","One-year + company history")+'<div class="ci-deal-feed">'+(rows.length?rows.map(x=>'<article><div class="ci-deal-date">'+esc(x.date)+(x.estimatedDate?' <span>year-level date</span>':'')+'</div><div><div class="ci-deal-company">'+(typeof cpCompanyLogo==="function"?cpCompanyLogo(x.company):"")+'<strong>'+esc(x.company)+'</strong></div><div class="ci-deal-tags"><span>'+esc(x.type)+'</span><span>'+esc(x.rationale)+'</span></div><h3>'+esc(x.title)+'</h3><p>'+esc(x.detail)+'</p><div class="ci-implication"><b>Strategic implication</b><p>'+esc(ciDealImplication(x))+'</p></div><a href="'+x.source+'" target="_blank" rel="noopener">Open supporting source ↗</a></div></article>').join(''):'<div class="ci-empty">No transactions match the current filters.</div>')+'</div></section>';
}

/* SOCIAL / DIGITAL V2 */
function ci2SocialMonths(profile,s){
  const months=[];for(let i=5;i>=0;i--){const d=new Date("2026-09-18T00:00:00");d.setMonth(d.getMonth()-i);const label=d.toLocaleString("en",{month:"short"}),seed=ciHash(profile.name+"|"+s.platform+"|"+label);months.push({label,value:2+(seed%9)+(s.company==="All companies"?2:0)})}return months;
}
function ci2PlatformMix(p,s){
  const ps=["LinkedIn","YouTube","X","Instagram"];return ps.map(pl=>({label:pl,value:8+(ciHash(p.name+pl+s.period)%33)}));
}
function ci2ContentTypes(p){
  const blob=JSON.stringify(p).toLowerCase();
  return [
    {label:"Product / innovation",value:blob.includes("product")?32:24},
    {label:"Clinical / evidence",value:blob.includes("clinical")?24:18},
    {label:"Corporate / strategy",value:22},
    {label:"Education / events",value:16+(ciHash(p.name)%7)},
    {label:"People / culture",value:10+(ciHash(p.name+"people")%6)}
  ];
}
function renderSocialDigitalPage(){
  const s=ciIntelState["social-digital"],profiles=ciProfiles(),names=ciNames(),platforms=["All platforms","LinkedIn","YouTube","X","Instagram"],themes=ciUnique(profiles.flatMap(ciSocialThemes));
  const selected=profiles.filter(p=>(s.company==="All companies"||p.name===s.company)&&(s.theme==="All themes"||ciSocialThemes(p).includes(s.theme)));
  const metricRows=selected.map(p=>({profile:p,m:ciSocialMetrics(p,s.platform,s.period)})),postRows=metricRows.map(x=>({label:x.profile.name,value:x.m.posts})).sort((a,b)=>b.value-a.value);
  const totalPosts=postRows.reduce((a,x)=>a+x.value,0)||1,sov=postRows.map(x=>({label:x.label,value:Math.round(x.value/totalPosts*100)}));
  const lead=selected[0]||profiles[0],trend=lead?ci2SocialMonths(lead,s):[];
  const avg=metricRows.length?{positive:Math.round(metricRows.reduce((a,x)=>a+x.m.positive,0)/metricRows.length),negative:Math.round(metricRows.reduce((a,x)=>a+x.m.negative,0)/metricRows.length)}:{positive:0,negative:0};avg.neutral=100-avg.positive-avg.negative;
  $('breadcrumbSmall').textContent='Competitive Intelligence / Social & Digital Media';$('breadcrumbTitle').textContent=currentDomain+' — Social & Digital';
  $('pageContent').innerHTML=ciPageHead("Social & Digital Media",'Directional digital-listening dashboard for <b>'+esc(currentDomain)+'</b>, combining public-channel visibility, posting cadence, content themes, sentiment, share of voice and recent public-content signals.')+
    '<section class="ci-filter-shell">'+ciFilterSelect("Company","company",["All companies",...names],s.company,"social-digital")+ciFilterSelect("Platform","platform",platforms,s.platform,"social-digital")+ciFilterSelect("Theme","theme",["All themes",...themes],s.theme,"social-digital")+ciFilterSelect("Time Period","period",["30 days","90 days","6 months","1 year"],s.period,"social-digital")+'</section>'+
    '<section class="section">'+ci2Kpis([
      {label:"Estimated posts",value:postRows.reduce((a,x)=>a+x.value,0),note:s.period+" · "+s.platform},
      {label:"Estimated share-of-voice leader",value:sov[0]?.label||"N/A",note:(sov[0]?.value||0)+"% directional SOV"},
      {label:"Positive tone",value:avg.positive+"%",note:"Directional content sentiment"},
      {label:"Cautionary tone",value:avg.negative+"%",note:"Risk / correction / challenge language"},
      {label:"Visible themes",value:ciUnique(selected.flatMap(ciSocialThemes)).length,note:"Loaded narrative themes"},
      {label:"Companies tracked",value:selected.length,note:"Under current filters"}
    ])+'</section>'+
    '<section class="section"><div class="grid-3"><div class="card"><div class="card-title"><h3>Estimated share of voice</h3><small>Relative posting intensity</small></div>'+ciDonut(sov)+'</div><div class="card"><div class="card-title"><h3>Six-month cadence</h3><small>'+esc(lead?.name||"Selected set")+'</small></div>'+ciLineChart(trend,"label","value")+'</div><div class="card"><div class="card-title"><h3>Sentiment mix</h3><small>Directional tone</small></div>'+ciDonut([{label:"Positive",value:avg.positive},{label:"Neutral",value:avg.neutral},{label:"Negative / cautionary",value:avg.negative}])+'</div></div></section>'+
    (lead?'<section class="section"><div class="grid-2"><div class="card"><div class="card-title"><h3>Platform mix</h3><small>'+esc(lead.name)+'</small></div>'+ciDonut(ci2PlatformMix(lead,s))+'</div><div class="card"><div class="card-title"><h3>Content-type mix</h3><small>Directional message architecture</small></div>'+ciDonut(ci2ContentTypes(lead))+'</div></div></section>':'')+
    '<section class="section">'+ciSectionTitle("Theme × company matrix","Shows how recurring public narratives distribute across the competitive set.","Profile + public-content proxy")+'<div class="card">'+ci2Heatmap(selected.map(p=>p.name),ciUnique(selected.flatMap(ciSocialThemes)).slice(0,9),(name,t)=>{const p=selected.find(x=>x.name===name);return ciSocialThemes(p).includes(t)?1:0},"1 indicates a recurring theme in the loaded company profile / public-content evidence.")+'</div></section>'+
    '<section class="section">'+ciSectionTitle("Company digital-intelligence cards","Public search links enable manual review; recent content signals come from source-linked company / regulatory news.","Directional prototype")+
      '<div class="ci-social-grid">'+selected.map(p=>{const m=ciSocialMetrics(p,s.platform,s.period),ts=ciSocialThemes(p);return '<article class="ci-social-card"><div class="ci-social-head">'+cpCompanyLogo(p.name)+'<div><h3>'+esc(p.name)+'</h3><p>'+esc((p.focusTags||[]).join(" · "))+'</p></div><b>'+m.engagement+'</b></div><div class="ci-social-kpis"><span><b>'+m.posts+'</b> estimated posts</span><span><b>'+m.positive+'%</b> positive</span><span><b>'+m.negative+'%</b> cautionary</span></div><div class="ci-social-themes">'+ts.map(t=>'<span>'+esc(t)+'</span>').join('')+'</div><div class="ci-social-signals"><b>Recent public-content signals</b>'+ciSocialContentSignals(p).map(n=>'<div><time>'+esc(n.date)+'</time><span>'+esc(n.title)+'</span></div>').join('')+'</div><div class="ci-social-links">'+["LinkedIn","YouTube","X","Instagram"].map(pl=>'<a href="'+ciSocialLink(pl,p.name)+'" target="_blank" rel="noopener">'+pl+' search ↗</a>').join('')+'</div></article>'}).join('')+'</div></section>'+
    '<section class="section"><div class="research-note"><strong>Method note:</strong> platform APIs do not expose complete public posting histories in this prototype. Share of voice, cadence, engagement and sentiment are clearly modeled estimates for dashboard demonstration; public search links and source-linked content signals are provided for validation.</div></section>';
}

/* STRATEGY V2 */
function ci2StrategyNewsSignals(p,period){
  const cut=ciPeriodCutoff(period||"1 year");
  const news=ciSyntheticNews().filter(n=>n.company===p.name&&ciDateVal(n.date)>=cut);
  const map={"Product / portfolio":["Product & Services"],"Evidence / R&D":["Clinical, R&D"],"M&A / ecosystem":["Partnership, M&A"],"Organization":["Leadership Changes","Organizational Updates"],"Financial execution":["Financials"]};
  return Object.entries(map).map(([label,themes])=>({label,value:news.filter(n=>themes.includes(ciTheme(n))).length}));
}
function ci2StrategyTrend(profiles,period){
  const cut=ciPeriodCutoff(period||"1 year"),names=new Set(profiles.map(p=>p.name));
  const news=ciSyntheticNews().filter(n=>names.has(n.company)&&ciDateVal(n.date)>=cut);
  return ci2MonthRows(news);
}
function ci2Archetype(p){
  const d=ciStrategyScore2(p,"digital"),r=ciStrategyScore2(p,"rd"),g=ciStrategyScore2(p,"geographic"),prod=ciStrategyScore2(p,"product");
  if(d>86&&r>86)return "Tech-enabled innovator";
  if(g>88&&prod>84)return "Scaled portfolio leader";
  if(r>88)return "Innovation specialist";
  if(d>84)return "Connected-workflow challenger";
  return "Focused category operator";
}
function renderStrategyPositioningPage(){
  const s=ciIntelState["strategy-positioning"];if(!s.period)s.period="1 year";
  const profiles=ciProfiles(),names=ciNames(),regions=ciUnique(profiles.flatMap(p=>p.regions||[])),lensMap={"All strategic lenses":null,"Business":"business","Product":"product","Channel":"channel","Geographic":"geographic","Digital":"digital","R&D":"rd","Expansion":"expansion"};
  const selected=profiles.filter(p=>(s.company==="All companies"||p.name===s.company)&&(s.region==="All Regions"||(p.regions||[]).includes(s.region))),keys=s.lens==="All strategic lenses"?["business","product","channel","geographic","digital","rd","expansion"]:[lensMap[s.lens]];
  const heatRows=selected.map(p=>({p,vals:keys.map(k=>({k,v:ciStrategyScore2(p,k)}))}));
  const signalThemes=["Product / portfolio","Evidence / R&D","M&A / ecosystem","Organization","Financial execution"];
  $('breadcrumbSmall').textContent='Competitive Intelligence / Strategy & Market Positioning';$('breadcrumbTitle').textContent=currentDomain+' — Strategy & Positioning';
  $('pageContent').innerHTML=ciPageHead("Strategy & Market Positioning",'A multi-layer view of competitive posture in <b>'+esc(currentDomain)+'</b>, connecting stated strategy with one-year product, evidence, transaction and organizational signals.')+
    '<section class="ci-filter-shell">'+ciFilterSelect("Company","company",["All companies",...names],s.company,"strategy-positioning")+ciFilterSelect("Region","region",["All Regions",...regions],s.region,"strategy-positioning")+ciFilterSelect("Strategic lens","lens",Object.keys(lensMap),s.lens,"strategy-positioning")+ciFilterSelect("Evidence period","period",["90 days","6 months","1 year"],s.period,"strategy-positioning")+'</section>'+
    '<section class="section">'+ci2Kpis([
      {label:"Companies in view",value:selected.length,note:s.region},
      {label:"Tech-enabled innovators",value:selected.filter(p=>ci2Archetype(p)==="Tech-enabled innovator").length,note:"Directional archetype"},
      {label:"High digital emphasis",value:selected.filter(p=>ciStrategyScore2(p,"digital")>=85).length,note:"Illustrative index >=85"},
      {label:"High R&D emphasis",value:selected.filter(p=>ciStrategyScore2(p,"rd")>=85).length,note:"Illustrative index >=85"},
      {label:"M&A / ecosystem signals",value:selected.reduce((a,p)=>a+ci2StrategyNewsSignals(p,s.period).find(x=>x.label==="M&A / ecosystem").value,0),note:s.period},
      {label:"Regions represented",value:ciUnique(selected.flatMap(p=>p.regions||[])).length,note:"Documented presence"}
    ])+'</section>'+
    '<section class="section"><div class="grid-2"><div class="card"><div class="card-title"><h3>Innovation × digital positioning map</h3><small>Directional public-strategy interpretation</small></div>'+ciPositionMatrix(selected)+'</div><div class="card"><div class="card-title"><h3>Strategy-signal mix</h3><small>'+esc(s.period)+' news evidence</small></div>'+ci2Heatmap(selected.map(p=>p.name),signalThemes,(name,t)=>ci2StrategyNewsSignals(selected.find(p=>p.name===name),s.period).find(x=>x.label===t)?.value||0)+'</div></div></section>'+
    '<section class="section"><div class="grid-2"><div class="card"><div class="card-title"><h3>Strategic signal velocity</h3><small>Monthly source-linked developments · '+esc(s.period)+'</small></div>'+ciLineChart(ci2StrategyTrend(selected,s.period),"label","value")+'</div><div class="card"><div class="card-title"><h3>Strategic archetype mix</h3><small>Directional positioning clusters</small></div>'+ciDonut(ciUnique(selected.map(ci2Archetype)).map(a=>({label:a,value:selected.filter(p=>ci2Archetype(p)===a).length})))+'</div></div></section>'+
    '<section class="section">'+ciSectionTitle("Strategic emphasis heatmap","Compares business, product, channel, geography, digital, R&D and expansion emphasis across the selected companies.","Illustrative analyst index")+'<div class="card"><div class="table-scroll"><table class="data-table ci-heatmap"><thead><tr><th>Company</th><th>Archetype</th>'+keys.map(k=>'<th>'+esc(k==="rd"?"R&D":k[0].toUpperCase()+k.slice(1))+'</th>').join('')+'</tr></thead><tbody>'+heatRows.map(r=>'<tr><td><strong>'+esc(r.p.name)+'</strong></td><td>'+esc(ci2Archetype(r.p))+'</td>'+r.vals.map(x=>'<td><span style="--heat:'+x.v+'">'+x.v+'</span></td>').join('')+'</tr>').join('')+'</tbody></table></div></div></section>'+
    '<section class="section">'+ciSectionTitle("Regional strategic presence","Documented geographic presence across the competitive set; useful for identifying market-density and white-space questions.","Profile evidence")+'<div class="card">'+ci2RegionalMatrix(selected,regions)+'</div></section>'+
    '<section class="section">'+ciSectionTitle("Strategy cards","Detailed strategic narrative and monitoring agenda for each selected company.","Company reporting + analyst synthesis")+'<div class="ci-strategy-company-grid">'+selected.map(p=>'<article class="card"><div class="ci-strategy-company-head">'+cpCompanyLogo(p.name)+'<div><h3>'+esc(p.name)+'</h3><p>'+esc(ci2Archetype(p)+' · '+(p.focusTags||[]).join(" · "))+'</p></div></div><div class="ci-strategy-lines">'+keys.map(k=>'<div><b>'+esc(k==="rd"?"R&D":k[0].toUpperCase()+k.slice(1))+'</b><p>'+esc(ciStrategyValue(p,k))+'</p></div>').join('')+'</div><div class="ci-watch"><b>Key watchpoints</b><p>'+esc((p.riskWatchpoints||["Execution against stated strategy","Competitive response","Market access / reimbursement"]).join(" · "))+'</p></div></article>').join('')+'</div></section>';
}

/* CONFERENCE / KOL V2 */
function ci2EventNews(e){
  const d=ciDateVal(e.start),lo=new Date(d);lo.setDate(lo.getDate()-21);const hi=new Date(d);hi.setDate(hi.getDate()+21);
  return ciSyntheticNews().filter(n=>{const nd=ciDateVal(n.date);return nd>=lo&&nd<=hi&&["Product & Services","Clinical, R&D","Partnership, M&A"].includes(ciTheme(n))});
}
function ci2ConferenceTimeline(events){
  return '<div class="ci2-event-timeline">'+events.slice().sort((a,b)=>ciDateVal(a.start)-ciDateVal(b.start)).map(e=>'<article><time>'+esc(e.start.slice(5))+'</time><div><span>'+esc(e.status)+'</span><strong>'+esc(e.name)+'</strong><p>'+esc(e.venue)+'</p></div></article>').join('')+'</div>';
}
function renderConferenceKOLPage(){
  const s=ciIntelState["conference-kol"],events=ciConferenceFiltered(),all=ciConferenceData(),themes=ciUnique(all.flatMap(e=>e.themes||[])),years=ciUnique(all.map(e=>e.start.slice(0,4))),names=ciNames(),profile=s.company==="All companies"?null:ciProfileByName(s.company),kols=ciUnique(events.flatMap(e=>e.kols||[]));
  const themeRows=themes.map(t=>({label:t,value:events.filter(e=>(e.themes||[]).includes(t)).length})).filter(x=>x.value).sort((a,b)=>b.value-a.value).slice(0,10);
  const quarterMap={};events.forEach(e=>{const q=ci2Quarter(e.start);quarterMap[q]=(quarterMap[q]||0)+1});
  const conferenceTrend=Object.entries(quarterMap).sort((a,b)=>a[0].localeCompare(b[0])).map(([label,value])=>({label,value}));
  const launchSignals=events.reduce((a,e)=>a+ci2EventNews(e).length,0);
  $('breadcrumbSmall').textContent='Competitive Intelligence / Conference & KOL Intelligence';$('breadcrumbTitle').textContent=currentDomain+' — Conference & KOL';
  $('pageContent').innerHTML=ciPageHead("Conference & KOL Intelligence",'A forward- and backward-looking view of scientific meetings relevant to <b>'+esc(currentDomain)+'</b>, linking official event details with themes, selected KOL / faculty, competitor relevance and nearby launch / evidence signals.')+
    '<section class="ci-filter-shell">'+ciFilterSelect("Event status","status",["All events","Past","Upcoming"],s.status,"conference-kol")+ciFilterSelect("Theme","theme",["All themes",...themes],s.theme,"conference-kol")+ciFilterSelect("Year","year",["All years",...years],s.year,"conference-kol")+ciFilterSelect("Company relevance","company",["All companies",...names],s.company,"conference-kol")+'</section>'+
    '<section class="section">'+ci2Kpis([
      {label:"Events in view",value:events.length,note:s.status},
      {label:"Upcoming events",value:events.filter(e=>e.status==="Upcoming").length,note:"Watchlist"},
      {label:"Distinct themes",value:ciUnique(events.flatMap(e=>e.themes||[])).length,note:"Scientific / commercial topics"},
      {label:"KOL / faculty names",value:kols.length,note:"Selected event references"},
      {label:"Nearby launch / evidence signals",value:launchSignals,note:"+/-21 days from event"},
      {label:"Next conference",value:events.filter(e=>e.status==="Upcoming").sort((a,b)=>ciDateVal(a.start)-ciDateVal(b.start))[0]?.start||"N/A",note:events.filter(e=>e.status==="Upcoming").sort((a,b)=>ciDateVal(a.start)-ciDateVal(b.start))[0]?.name||""}
    ])+'</section>'+
    '<section class="section"><div class="grid-3"><div class="card"><div class="card-title"><h3>Conference calendar</h3><small>Chronological view</small></div>'+ci2ConferenceTimeline(events)+'</div><div class="card"><div class="card-title"><h3>Theme frequency</h3></div>'+ciHorizontalBars(themeRows)+'</div><div class="card"><div class="card-title"><h3>KOL / faculty watchlist</h3></div><div class="ci-kol-list">'+kols.map(k=>'<span>'+esc(k)+'</span>').join('')+'</div><p class="ci-chart-note">Names reflect loaded event leadership / faculty references where available; inclusion is not an endorsement.</p></div></div></section>'+
    '<section class="section"><div class="grid-2"><div class="card"><div class="card-title"><h3>Conference activity trend</h3><small>Events by quarter</small></div>'+ciLineChart(conferenceTrend,"label","value")+'</div><div class="card"><div class="card-title"><h3>Past vs upcoming mix</h3><small>Current selected event set</small></div>'+ciDonut([{label:"Past",value:events.filter(e=>e.status==="Past").length},{label:"Upcoming",value:events.filter(e=>e.status==="Upcoming").length}].filter(x=>x.value))+'</div></div></section>'+
    '<section class="section">'+ciSectionTitle("Event × company relevance matrix","Highlights which conferences are most aligned to each competitor's loaded focus, portfolio and technology themes.","Directional relevance index")+'<div class="card">'+ci2Heatmap(events.map(e=>e.name),profile?[profile.name]:ciNames(),(eventName,companyName)=>{const e=events.find(x=>x.name===eventName),p=ciProfileByName(companyName);return Math.round(ciConferenceRelevance(e,p)/10)},"Values are relevance deciles derived from loaded profile themes; they are not attendance claims.")+'</div></section>'+
    '<section class="section">'+ciSectionTitle("Conference-linked launch & evidence tracker","Public product, clinical and partnership signals published within 21 days of each event date.","Source-linked news overlay")+
      '<div class="ci2-event-signals">'+events.map(e=>{const ns=ci2EventNews(e);return '<article><div><strong>'+esc(e.name)+'</strong><span>'+esc(e.start)+' · '+esc(e.venue)+'</span></div><b>'+ns.length+'</b><p>'+esc(ns.slice(0,3).map(n=>n.company+": "+n.title).join(" | ")||"No nearby source-linked launch / evidence signal is loaded.")+'</p></article>'}).join('')+'</div></section>'+
    '<section class="section">'+ciSectionTitle("Conference detail","Official dates, venue, themes, faculty / KOL references, company relevance and direct official links.","Past + upcoming")+'<div class="ci-conference-grid">'+events.map(e=>'<article class="ci-conference-card"><div class="ci-conf-top"><span class="'+e.status.toLowerCase()+'">'+esc(e.status)+'</span><time>'+esc(e.start)+(e.end&&e.end!==e.start?' → '+esc(e.end):'')+'</time></div><h3>'+esc(e.name)+'</h3><p class="venue">'+esc(e.venue)+'</p><p>'+esc(e.summary)+'</p><div class="ci-social-themes">'+(e.themes||[]).map(t=>'<span>'+esc(t)+'</span>').join('')+'</div>'+(profile?'<div class="ci-conf-relevance"><b>'+ciConferenceRelevance(e,profile)+'</b><span>'+esc(profile.name)+' relevance index</span></div>':'')+'<div class="ci-conf-kol"><b>Selected KOL / faculty</b><p>'+esc((e.kols||[]).join(" · "))+'</p></div><a href="'+e.url+'" target="_blank" rel="noopener">Open official conference website ↗</a></article>').join('')+'</div></section>';
}
