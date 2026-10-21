const CI_NEWS_THEMES=["All themes","Clinical, R&D","Financials","Leadership Changes","Organizational Updates","Other","Partnership, M&A","Product & Services"];
let ciIntelState={
  "news-alerts":{company:"All companies",theme:"All themes",period:"1 year",source:"All sources"},
  "product-portfolio":{companyA:"",companyB:"",category:"All categories",region:"All Regions",lens:"Overall benchmark"},
  "ma-partnerships":{company:"All companies",type:"All deal types",period:"All periods",rationale:"All rationales"},
  "social-digital":{company:"All companies",platform:"All platforms",theme:"All themes",period:"90 days"},
  "strategy-positioning":{company:"All companies",region:"All Regions",lens:"All strategic lenses"},
  "conference-kol":{status:"All events",theme:"All themes",year:"All years",company:"All companies"}
};

function ciProfiles(){return (window.COMPANY_PROFILES&&COMPANY_PROFILES[currentDomain])||[]}
function ciProfileByName(name){return ciProfiles().find(p=>p.name===name)}
function ciNames(){return ciProfiles().map(p=>p.name)}
function ciTheme(item){
  const t=item.theme||"Other";
  if(t==="Regulatory & Access")return "Clinical, R&D";
  return CI_NEWS_THEMES.includes(t)?t:"Other";
}
function ciDateVal(s){return new Date((s||"2000-01-01")+"T00:00:00")}
function ciMonthsAgo(n){const d=new Date("2026-09-18T00:00:00");d.setMonth(d.getMonth()-n);return d}
function ciPeriodCutoff(period){
  if(period==="30 days")return new Date("2026-08-19T00:00:00");
  if(period==="90 days")return ciMonthsAgo(3);
  if(period==="6 months")return ciMonthsAgo(6);
  if(period==="1 year")return new Date("2025-09-18T00:00:00");
  if(period==="3 years")return new Date("2023-09-18T00:00:00");
  return new Date("2000-01-01T00:00:00");
}
function ciHash(str){let h=0;for(const c of String(str))h=(h*31+c.charCodeAt(0))>>>0;return h}
function ciPct(v){return Math.max(0,Math.min(100,Math.round(v)))}
function ciFilterSelect(label,key,values,value,module){
  return '<label>'+esc(label)+'<select onchange="updateCIIntelFilter(\''+module+'\',\''+key+'\',this.value)">'+values.map(v=>'<option value="'+esc(v)+'" '+(v===value?'selected':'')+'>'+esc(v)+'</option>').join('')+'</select></label>';
}
function updateCIIntelFilter(module,key,value){
  ciIntelState[module][key]=value;
  renderCIIntelligence(module);
}
function ciResetModule(module){
  if(module==="news-alerts")ciIntelState[module]={company:"All companies",theme:"All themes",period:"1 year",source:"All sources"};
  if(module==="product-portfolio")ciIntelState[module]={companyA:ciNames()[0]||"",companyB:ciNames()[1]||ciNames()[0]||"",category:"All categories",region:"All Regions",lens:"Overall benchmark"};
  if(module==="ma-partnerships")ciIntelState[module]={company:"All companies",type:"All deal types",period:"All periods",rationale:"All rationales"};
  if(module==="social-digital")ciIntelState[module]={company:"All companies",platform:"All platforms",theme:"All themes",period:"90 days"};
  if(module==="strategy-positioning")ciIntelState[module]={company:"All companies",region:"All Regions",lens:"All strategic lenses"};
  if(module==="conference-kol")ciIntelState[module]={status:"All events",theme:"All themes",year:"All years",company:"All companies"};
}
function ciEnsureState(module){
  if(!ciIntelState[module])ciResetModule(module);
  if(module==="product-portfolio"&&!ciIntelState[module].companyA)ciResetModule(module);
}
function ciPageHead(title,desc){
  return '<div class="page-head ci-page-head"><div class="title-wrap"><div class="breadcrumb"><button onclick="navigate(\'executive\')">Executive Hub</button> / <button onclick="openSegment(\'ci\')">Competitive Intelligence</button> / '+esc(title)+'</div><h1>'+esc(title)+'</h1><p>'+desc+'</p></div></div>';
}
function ciSectionTitle(title,desc,tag){
  return '<div class="section-head"><div><h2>'+esc(title)+'</h2><p>'+esc(desc)+'</p></div>'+(tag?'<span class="ci-data-tag">'+esc(tag)+'</span>':'')+'</div>';
}
function ciHorizontalBars(rows,maxOverride){
  if(!rows.length)return '<div class="ci-empty">No data for the selected filters.</div>';
  const max=maxOverride||Math.max(...rows.map(r=>r.value),1);
  return '<div class="ci-bars">'+rows.map(r=>'<div class="ci-bar-row"><span>'+esc(r.label)+'</span><div><i style="width:'+ciPct(r.value/max*100)+'%"></i></div><b>'+esc(r.display!=null?r.display:r.value)+'</b></div>').join('')+'</div>';
}
function ciLineChart(points,labelKey,valueKey){
  if(!points||points.length<2)return '<div class="ci-empty">Not enough observations to plot a trend.</div>';
  const W=720,H=250,pL=36,pR=18,pT=28,pB=42,vals=points.map(p=>Number(p[valueKey])),max=Math.max(...vals,1),min=0;
  const x=i=>pL+i*(W-pL-pR)/(points.length-1),y=v=>pT+(max-v)*(H-pT-pB)/(max-min||1);
  const coords=points.map((p,i)=>[x(i),y(Number(p[valueKey]))]);
  return '<div class="ci-line-chart"><svg viewBox="0 0 '+W+' '+H+'">'+
    [0,1,2,3].map(i=>{const yy=pT+i*(H-pT-pB)/3;return '<line x1="'+pL+'" y1="'+yy+'" x2="'+(W-pR)+'" y2="'+yy+'" stroke="#e8edef"/>'}).join('')+
    '<polyline points="'+coords.map(p=>p.join(",")).join(" ")+'" fill="none" stroke="#003b5c" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>'+
    coords.map((pt,i)=>'<circle cx="'+pt[0]+'" cy="'+pt[1]+'" r="5" fill="#0076a8" stroke="#fff" stroke-width="2"/><text x="'+pt[0]+'" y="'+(pt[1]-9)+'" text-anchor="middle" font-size="11" font-weight="800" fill="#003b5c">'+points[i][valueKey]+'</text><text x="'+pt[0]+'" y="'+(H-13)+'" text-anchor="middle" font-size="10" font-weight="700" fill="#6b7478">'+esc(points[i][labelKey])+'</text>').join('')+
    '</svg></div>';
}
function ciDonut(items){
  if(!items.length)return '<div class="ci-empty">No category data for this selection.</div>';
  const total=items.reduce((s,x)=>s+x.value,0)||1,colors=["#003b5c","#0076a8","#5a8092","#ed6a9a","#6b757a","#a8b7bf","#828c91","#cad4d9"];
  let cur=0;const grad=items.map((x,i)=>{const a=cur;cur+=x.value/total*100;return colors[i%colors.length]+' '+a+'% '+cur+'%'}).join(",");
  return '<div class="ci-donut-wrap"><div class="ci-donut" style="background:conic-gradient('+grad+')"><div><b>'+total+'</b><span>Total signals</span></div></div><div class="ci-donut-legend">'+items.map((x,i)=>'<div><i style="background:'+colors[i%colors.length]+'"></i><span>'+esc(x.label)+'</span><b>'+x.value+'</b></div>').join('')+'</div></div>';
}

/* -------- NEWS & ALERTS -------- */
function ciSyntheticNews(){
  const real=(window.CI_NEWS_RESEARCH&&CI_NEWS_RESEARCH[currentDomain])||[];
  const seen=new Set(real.map(x=>x.company));
  const extra=[];
  ciProfiles().forEach((p,i)=>{
    if(seen.has(p.name))return;
    const source=(p.sources||[])[0];
    extra.push({
      date:"2026-02-"+String(8+(ciHash(p.name)%18)).padStart(2,"0"),
      company:p.name,theme:"Financials",
      title:p.name+" updates annual business priorities and performance",
      summary:(p.financials?.latestInsights||[]).slice(0,2).join(" ")||("The latest company reporting highlights "+(p.focusTags||[]).join(", ")+" as core areas of focus."),
      source:p.name,sourceType:"Company reporting",url:source?.url||"#",estimated:true
    });
  });
  return [...real,...extra].sort((a,b)=>ciDateVal(b.date)-ciDateVal(a.date));
}
function ciFilteredNews(){
  const s=ciIntelState["news-alerts"],cut=ciPeriodCutoff(s.period);
  return ciSyntheticNews().filter(n=>{
    if(ciDateVal(n.date)<cut)return false;
    if(s.company!=="All companies"&&n.company!==s.company)return false;
    if(s.theme!=="All themes"&&ciTheme(n)!==s.theme)return false;
    if(s.source!=="All sources"&&n.sourceType!==s.source)return false;
    return true;
  });
}
function ciNewsSummary(news){
  if(!news.length)return '<div class="ci-empty">No news matches the selected filters. Broaden one or more filters.</div>';
  const counts={};news.forEach(n=>counts[ciTheme(n)]=(counts[ciTheme(n)]||0)+1);
  const top=Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,3);
  const companies=[...new Set(news.map(n=>n.company))];
  const milestones=news.filter(n=>n.milestone).length;
  return '<div class="ci-summary-grid"><article><span>Coverage</span><strong>'+news.length+' relevant items</strong><p>'+companies.length+' companies represented in the selected period.</p></article>'+
    '<article><span>Leading themes</span><strong>'+top.map(x=>x[0]).join(" · ")+'</strong><p>'+top.map(x=>x[0]+" ("+x[1]+")").join(", ")+' account for the largest share of observed activity.</p></article>'+
    '<article><span>Milestone intensity</span><strong>'+milestones+' milestone events</strong><p>Regulatory, clinical and executive changes are separated from general commercial news for faster review.</p></article>'+
    '<article><span>Strategic read-through</span><strong>'+esc(companies.length===1?companies[0]:"Competitive activity is distributed")+'</strong><p>'+esc(news.some(n=>ciTheme(n)==="Product & Services")?"Product / service launches are a visible source of activity. ":"")+esc(news.some(n=>ciTheme(n)==="Partnership, M&A")?"Partnership and transaction signals suggest active capability building. ":"")+'</p></article></div>';
}
function ciNewsFeed(news){
  return '<div class="ci-news-feed">'+news.map(n=>'<article class="ci-news-card">'+
    '<div class="ci-news-company">'+(typeof cpCompanyLogo==="function"?cpCompanyLogo(n.company):"")+'<strong>'+esc(n.company)+'</strong></div>'+
    '<div class="ci-news-meta"><time>'+esc(n.date)+'</time><span>'+esc(ciTheme(n))+'</span><span>'+esc(n.sourceType)+'</span>'+(n.estimated?'<span class="estimate">Demo reporting-cycle date</span>':'')+'</div>'+
    '<h3>'+esc(n.title)+'</h3><p>'+esc(n.summary)+'</p><div class="ci-news-source"><b>'+esc(n.source)+'</b><a href="'+n.url+'" target="_blank" rel="noopener">Open exact source ↗</a></div></article>').join('')+'</div>';
}
function ciNewsMilestones(news){
  const types=["Regulatory Milestone","Clinical Trial Update","Executive Movement"];
  const rows=news.filter(n=>types.includes(n.milestone)).sort((a,b)=>ciDateVal(b.date)-ciDateVal(a.date));
  if(!rows.length)return '<div class="ci-empty">No regulatory, clinical-trial or executive milestone is loaded for the current filters.</div>';
  return '<div class="ci-milestones">'+rows.map(n=>'<article><div class="ci-mile-date">'+esc(n.date)+'</div><div><span>'+esc(n.milestone)+'</span><strong>'+esc(n.company)+' — '+esc(n.title)+'</strong><p>'+esc(n.summary)+'</p><a href="'+n.url+'" target="_blank" rel="noopener">'+esc(n.source)+' ↗</a></div></article>').join('')+'</div>';
}
function renderNewsAlertsPage(){
  const s=ciIntelState["news-alerts"],all=ciSyntheticNews(),sources=ciUnique(all.map(x=>x.sourceType)),news=ciFilteredNews();
  const companies=ciUnique(all.map(x=>x.company));
  const byCompany=ciUnique(news.map(x=>x.company)).map(c=>({label:c,value:news.filter(n=>n.company===c).length})).sort((a,b)=>b.value-a.value);
  const byTheme=CI_NEWS_THEMES.slice(1).map(t=>({label:t,value:news.filter(n=>ciTheme(n)===t).length})).filter(x=>x.value);
  const monthMap={};news.forEach(n=>{const m=n.date.slice(0,7);monthMap[m]=(monthMap[m]||0)+1});
  const monthRows=Object.entries(monthMap).sort((a,b)=>a[0].localeCompare(b[0])).map(([m,v])=>({month:m.slice(5)+"/"+m.slice(2,4),value:v}));
  $('breadcrumbSmall').textContent='Competitive Intelligence / News & Alerts';$('breadcrumbTitle').textContent=currentDomain+' — News & Alerts';
  $('pageContent').innerHTML=ciPageHead("News & Alerts",'Source-linked monitoring of relevant company, product, clinical, regulatory, organizational and transaction developments for <b>'+esc(currentDomain)+'</b>. Market-share and stock-price news are excluded from this feed.')+
    '<section class="ci-filter-shell">'+
      ciFilterSelect("Company","company",["All companies",...companies],s.company,"news-alerts")+
      ciFilterSelect("Themes","theme",CI_NEWS_THEMES,s.theme,"news-alerts")+
      ciFilterSelect("Time Period","period",["30 days","90 days","6 months","1 year","All periods"],s.period,"news-alerts")+
      ciFilterSelect("Source type","source",["All sources",...sources],s.source,"news-alerts")+
    '</section>'+
    '<section class="section">'+ciSectionTitle("News intelligence summary","What changed in the selected company / theme / period, and where activity is concentrated.","Curated public-source intelligence")+ciNewsSummary(news)+'</section>'+
    '<section class="section"><div class="grid-3"><div class="card"><div class="card-title"><h3>News volume by company</h3><small>'+news.length+' selected items</small></div>'+ciHorizontalBars(byCompany)+'</div><div class="card"><div class="card-title"><h3>News flow over time</h3><small>Monthly selected-news count</small></div>'+ciLineChart(monthRows,"month","value")+'</div><div class="card"><div class="card-title"><h3>Theme mix</h3><small>Selected-news taxonomy</small></div>'+ciDonut(byTheme)+'</div></div></section>'+
    '<section class="section">'+ciSectionTitle("Regulatory, clinical & executive milestone timeline","Priority events that can materially change product access, evidence, organizational direction or commercial execution.","Company / regulator sources")+ '<div class="card">'+ciNewsMilestones(news)+'</div></section>'+
    '<section class="section">'+ciSectionTitle("News summaries","Latest items first; each item retains company, theme, source type and exact source link.","Last 12 months by default")+ciNewsFeed(news)+'</section>'+
    '<section class="section"><div class="research-note"><strong>Coverage note:</strong> the feed is a curated source-linked research set built from company newsrooms, regulatory sources and reputable distribution wires. Where no indexed event was loaded for a company, a clearly labeled demo reporting-cycle item may be generated from the latest company profile so every filter remains usable. This is not a claim of exhaustive web capture.</div></section>';
}

/* -------- PRODUCT & PORTFOLIO BENCHMARKING -------- */
function ciProductCategories(){return ciUnique(ciProfiles().flatMap(p=>(p.products||[]).map(x=>x.category)))}
function ciBenchmarkScores(p,region,category){
  let products=p.products||[];
  if(category!=="All categories")products=products.filter(x=>x.category===category);
  const regional=(p.regionalPortfolio||[]).filter(x=>region==="All Regions"||x.region===region);
  const featureCount=products.reduce((s,x)=>s+(x.features||[]).length,0);
  const tech=(p.technology||[]).length,portfolio=(p.portfolioTags||[]).length;
  const digital=/digital|cloud|app|software|ai|connected/i.test(JSON.stringify(p))?88:64;
  const evidence=/clinical|evidence|trial|regulatory/i.test(JSON.stringify(p))?84:62;
  return {
    "Portfolio breadth":ciPct(48+products.length*10+portfolio*3),
    "Feature depth":ciPct(50+featureCount*4),
    "Technology differentiation":ciPct(54+tech*6),
    "Digital / connectivity":ciPct(digital+(ciHash(p.name)%7)-3),
    "Regional reach":ciPct(45+(region==="All Regions"?(p.regions||[]).length*10:regional.length?42:5)),
    "Evidence intensity":ciPct(evidence+(p.initiatives||[]).length*3)
  };
}
function ciBenchmarkMatrix(a,b,region,category){
  const sa=ciBenchmarkScores(a,region,category),sb=ciBenchmarkScores(b,region,category);
  const keys=Object.keys(sa);
  return '<div class="ci-benchmark-bars">'+keys.map(k=>'<div class="ci-bench-row"><strong>'+esc(k)+'</strong><div class="ci-bench-company"><span>'+esc(a.name)+'</span><div><i style="width:'+sa[k]+'%"></i></div><b>'+sa[k]+'</b></div><div class="ci-bench-company alt"><span>'+esc(b.name)+'</span><div><i style="width:'+sb[k]+'%"></i></div><b>'+sb[k]+'</b></div></div>').join('')+'<p class="ci-chart-note">Directional analyst index for demo visualization; not market share or an external rating.</p></div>';
}
function ciProductTable(p,category,region){
  let products=p.products||[];
  if(category!=="All categories")products=products.filter(x=>x.category===category);
  const regional=(p.regionalPortfolio||[]).filter(x=>region==="All Regions"||x.region===region);
  return '<div class="table-scroll"><table class="data-table ci-product-table"><thead><tr><th>Company</th><th>Category</th><th>Platform / product</th><th>USP</th><th>Key features</th><th>Positioning</th><th>Regional lens</th></tr></thead><tbody>'+
    products.map(x=>'<tr><td><strong>'+esc(p.name)+'</strong></td><td>'+esc(x.category)+'</td><td>'+esc(x.name)+'</td><td>'+esc(x.usp)+'</td><td>'+esc((x.features||[]).join(" · "))+'</td><td>'+esc(x.positioning)+'</td><td>'+esc(regional.length?regional.map(r=>r.items.join(", ")).join(" | "):(region==="All Regions"?"Global / multi-region profile":"No separate regional detail loaded"))+'</td></tr>').join('')+'</tbody></table></div>';
}
function ciPortfolioGaps(a,b,category){
  const ac=new Set((a.products||[]).filter(x=>category==="All categories"||x.category===category).map(x=>x.category));
  const bc=new Set((b.products||[]).filter(x=>category==="All categories"||x.category===category).map(x=>x.category));
  const onlyA=[...ac].filter(x=>!bc.has(x)),onlyB=[...bc].filter(x=>!ac.has(x)),shared=[...ac].filter(x=>bc.has(x));
  return '<div class="ci-gap-grid"><article><span>'+esc(a.name)+' only</span><strong>'+(onlyA.length?onlyA.length:"0")+' categories</strong><p>'+esc(onlyA.join(", ")||"No unique loaded category under this lens.")+'</p></article><article><span>'+esc(b.name)+' only</span><strong>'+(onlyB.length?onlyB.length:"0")+' categories</strong><p>'+esc(onlyB.join(", ")||"No unique loaded category under this lens.")+'</p></article><article><span>Shared battleground</span><strong>'+shared.length+' categories</strong><p>'+esc(shared.join(", ")||"No directly overlapping loaded category.")+'</p></article><article><span>Implication</span><strong>Benchmark workflow, not just features</strong><p>Product advantage should be validated through clinical evidence, workflow fit, regional availability, channel access and service—not feature counts alone.</p></article></div>';
}
function renderProductPortfolioPage(){
  const s=ciIntelState["product-portfolio"],names=ciNames(),profiles=ciProfiles();
  if(!names.includes(s.companyA))s.companyA=names[0]||"";
  if(!names.includes(s.companyB)||s.companyB===s.companyA)s.companyB=names.find(n=>n!==s.companyA)||s.companyA;
  const a=ciProfileByName(s.companyA),b=ciProfileByName(s.companyB),regions=ciUnique(profiles.flatMap(p=>p.regions||[])),cats=ciProductCategories();
  $('breadcrumbSmall').textContent='Competitive Intelligence / Product & Portfolio Benchmarking';$('breadcrumbTitle').textContent=currentDomain+' — Product Benchmarking';
  $('pageContent').innerHTML=ciPageHead("Product & Portfolio Benchmarking",'Compare representative products, features, technology, regional availability, evidence positioning and portfolio gaps across competitors in <b>'+esc(currentDomain)+'</b>.')+
    '<section class="ci-filter-shell five">'+
      ciFilterSelect("Company A","companyA",names,s.companyA,"product-portfolio")+
      ciFilterSelect("Company B","companyB",names,s.companyB,"product-portfolio")+
      ciFilterSelect("Category","category",["All categories",...cats],s.category,"product-portfolio")+
      ciFilterSelect("Region","region",["All Regions",...regions],s.region,"product-portfolio")+
      ciFilterSelect("Benchmark lens","lens",["Overall benchmark","Features","Technology","Digital","Regional reach","Evidence"],s.lens,"product-portfolio")+
    '</section>'+
    '<section class="section">'+ciSectionTitle("Benchmark snapshot","A comparative view of the selected competitors under the active category and regional lens.","Directional index")+ '<div class="grid-2"><div class="card"><div class="card-title"><h3>Capability comparison</h3><small>'+esc(s.category)+' · '+esc(s.region)+'</small></div>'+ciBenchmarkMatrix(a,b,s.region,s.category)+'</div><div class="card"><div class="card-title"><h3>Portfolio gap / overlap</h3><small>Loaded product categories</small></div>'+ciPortfolioGaps(a,b,s.category)+'</div></div></section>'+
    '<section class="section">'+ciSectionTitle("Product-level benchmark","Representative product platforms, differentiated value, features and positioning.","Company product materials")+ '<div class="card">'+ciProductTable(a,s.category,s.region)+ciProductTable(b,s.category,s.region)+'</div></section>'+
    '<section class="section"><div class="grid-2"><div class="card"><div class="card-title"><h3>'+esc(a.name)+' — strategic portfolio read-through</h3></div>'+cpStrategyGrid(a.strategy)+'</div><div class="card"><div class="card-title"><h3>'+esc(b.name)+' — strategic portfolio read-through</h3></div>'+cpStrategyGrid(b.strategy)+'</div></div></section>';
}

/* -------- M&A / PARTNERSHIPS / INVESTMENT -------- */
function ciDealType(x){
  const blob=((x.type||"")+" "+(x.title||"")+" "+(x.detail||"")).toLowerCase();
  if(blob.includes("acquir")||blob.includes("m&a")||blob.includes("merger"))return "M&A";
  if(blob.includes("invest"))return "Investment";
  if(blob.includes("distribut"))return "Distribution / Licensing";
  if(blob.includes("joint venture")||blob.includes("collabor")||blob.includes("partner"))return "Partnership";
  if(blob.includes("spin")||blob.includes("separat")||blob.includes("transformation"))return "Transformation";
  return x.type||"Other";
}
function ciDealRationale(x){
  const blob=(x.title+" "+x.detail).toLowerCase();
  if(/digital|software|ai|cloud|data|robot|navigation/.test(blob))return "Technology / Digital";
  if(/market|country|global|regional|international|network|lab/.test(blob))return "Geographic / Network";
  if(/product|portfolio|assay|test|implant|sensor|wound|vision/.test(blob))return "Portfolio Expansion";
  if(/distribut|access|channel|epic|apple/.test(blob))return "Channel / Access";
  if(/capacity|facility|manufactur/.test(blob))return "Capacity / Operations";
  return "Capability Building";
}
function ciDealEvents(){
  const rows=[];
  ciProfiles().forEach(p=>(p.deals||[]).forEach(d=>rows.push({company:p.name,year:String(d.year),date:String(d.year).length===4?String(d.year)+"-06-30":d.year,type:ciDealType(d),title:d.title,detail:d.detail,rationale:ciDealRationale(d),source:(p.sources||[])[0]?.url||"#",estimatedDate:String(d.year).length===4})));
  ((window.CI_NEWS_RESEARCH&&CI_NEWS_RESEARCH[currentDomain])||[]).filter(n=>ciTheme(n)==="Partnership, M&A"||["M&A","Partnership","Investment"].includes(n.milestone)).forEach(n=>rows.push({company:n.company,year:n.date.slice(0,4),date:n.date,type:ciDealType({type:n.milestone,title:n.title,detail:n.summary}),title:n.title,detail:n.summary,rationale:ciDealRationale({title:n.title,detail:n.summary}),source:n.url}));
  const seen=new Set();return rows.filter(x=>{const k=x.company+"|"+x.title;if(seen.has(k))return false;seen.add(k);return true}).sort((a,b)=>ciDateVal(b.date)-ciDateVal(a.date));
}
function ciDealImplication(x){
  const map={
    "Technology / Digital":"Adds or accelerates a technology capability that may increase ecosystem integration, switching costs or workflow differentiation.",
    "Geographic / Network":"Expands physical reach, account density or logistics capability and can shift local competitive intensity.",
    "Portfolio Expansion":"Fills a portfolio gap or broadens the addressable procedure / testing pathway, increasing cross-sell potential.",
    "Channel / Access":"Improves route-to-market, customer access or interoperability without requiring full asset ownership.",
    "Capacity / Operations":"Adds operational scale, manufacturing or service capacity that can support growth and resilience.",
    "Capability Building":"Strengthens a capability that supports the company's broader strategic agenda."
  };
  return map[x.rationale]||map["Capability Building"];
}
function ciFilteredDeals(){
  const s=ciIntelState["ma-partnerships"],cut=ciPeriodCutoff(s.period==="All periods"?"All periods":s.period);
  return ciDealEvents().filter(x=>(s.company==="All companies"||x.company===s.company)&&(s.type==="All deal types"||x.type===s.type)&&(s.rationale==="All rationales"||x.rationale===s.rationale)&&(s.period==="All periods"||ciDateVal(x.date)>=cut));
}
function renderMAPage(){
  const s=ciIntelState["ma-partnerships"],all=ciDealEvents(),rows=ciFilteredDeals(),types=ciUnique(all.map(x=>x.type)),rats=ciUnique(all.map(x=>x.rationale)),companies=ciUnique(all.map(x=>x.company));
  const byCompany=companies.map(c=>({label:c,value:rows.filter(x=>x.company===c).length})).filter(x=>x.value).sort((a,b)=>b.value-a.value);
  const byType=types.map(t=>({label:t,value:rows.filter(x=>x.type===t).length})).filter(x=>x.value);
  const byRat=rats.map(t=>({label:t,value:rows.filter(x=>x.rationale===t).length})).filter(x=>x.value);
  $('breadcrumbSmall').textContent='Competitive Intelligence / M&A Partnerships & Investment';$('breadcrumbTitle').textContent=currentDomain+' — M&A & Partnerships';
  $('pageContent').innerHTML=ciPageHead("M&A Partnerships & Investment",'Track how competitors in <b>'+esc(currentDomain)+'</b> acquire, partner for, license, distribute or invest in new capabilities—and translate each move into strategic implications.')+
    '<section class="ci-filter-shell">'+ciFilterSelect("Company","company",["All companies",...companies],s.company,"ma-partnerships")+ciFilterSelect("Deal type","type",["All deal types",...types],s.type,"ma-partnerships")+ciFilterSelect("Time period","period",["1 year","3 years","All periods"],s.period,"ma-partnerships")+ciFilterSelect("Strategic rationale","rationale",["All rationales",...rats],s.rationale,"ma-partnerships")+'</section>'+
    '<section class="section">'+ciSectionTitle("Deal activity dashboard","Where competitors are adding capabilities, reach and routes to market.","Source-linked + company history")+ '<div class="grid-3"><div class="card"><div class="card-title"><h3>Deals by company</h3></div>'+ciHorizontalBars(byCompany)+'</div><div class="card"><div class="card-title"><h3>Deal structure</h3></div>'+ciDonut(byType)+'</div><div class="card"><div class="card-title"><h3>Strategic rationale</h3></div>'+ciDonut(byRat)+'</div></div></section>'+
    '<section class="section">'+ciSectionTitle("Transaction & partnership timeline","Newest events first with analyst interpretation separated from observed facts.","Observed event + analyst implication")+
      '<div class="ci-deal-feed">'+(rows.length?rows.map(x=>'<article><div class="ci-deal-date">'+esc(x.date)+(x.estimatedDate?' <span>year-level date</span>':'')+'</div><div><div class="ci-deal-tags"><span>'+esc(x.company)+'</span><span>'+esc(x.type)+'</span><span>'+esc(x.rationale)+'</span></div><h3>'+esc(x.title)+'</h3><p>'+esc(x.detail)+'</p><div class="ci-implication"><b>Strategic implication</b><p>'+esc(ciDealImplication(x))+'</p></div><a href="'+x.source+'" target="_blank" rel="noopener">Open supporting source ↗</a></div></article>').join(''):'<div class="ci-empty">No deals match the current filters.</div>')+'</div></section>';
}

/* -------- SOCIAL & DIGITAL MEDIA -------- */
function ciSocialMetrics(p,platform,period){
  const seed=ciHash(p.name+"|"+platform+"|"+period),base=4+(seed%8),mult=period==="30 days"?1:period==="90 days"?3:period==="6 months"?6:12;
  const posts=base*mult,positive=58+(seed%18),negative=4+(seed%8),neutral=100-positive-negative;
  return {posts,positive,neutral,negative,engagement:55+(seed%39)};
}
function ciSocialThemes(p){
  const arr=[...(p.focusTags||[]),...(p.portfolioTags||[]),...(p.technology||[])];
  return ciUnique(arr).slice(0,6);
}
function ciSocialLink(platform,name){
  const q=encodeURIComponent(name);
  if(platform==="LinkedIn")return "https://www.linkedin.com/search/results/content/?keywords="+q;
  if(platform==="YouTube")return "https://www.youtube.com/results?search_query="+q;
  if(platform==="X")return "https://x.com/search?q="+q;
  if(platform==="Instagram")return "https://www.instagram.com/explore/search/keyword/?q="+q;
  return "https://www.google.com/search?q="+q+"%20social%20media";
}
function ciSocialContentSignals(p){
  return ((window.CI_NEWS_RESEARCH&&CI_NEWS_RESEARCH[currentDomain])||[])
    .filter(n=>n.company===p.name)
    .sort((a,b)=>ciDateVal(b.date)-ciDateVal(a.date))
    .slice(0,3);
}
function renderSocialDigitalPage(){
  const s=ciIntelState["social-digital"],profiles=ciProfiles(),names=ciNames(),platforms=["All platforms","LinkedIn","YouTube","X","Instagram"],themes=ciUnique(profiles.flatMap(ciSocialThemes));
  const selected=profiles.filter(p=>(s.company==="All companies"||p.name===s.company)&&(s.theme==="All themes"||ciSocialThemes(p).includes(s.theme)));
  const metricRows=selected.map(p=>({profile:p,m:ciSocialMetrics(p,s.platform,s.period)}));
  const postRows=metricRows.map(x=>({label:x.profile.name,value:x.m.posts})).sort((a,b)=>b.value-a.value);
  const avg=metricRows.length?{positive:Math.round(metricRows.reduce((a,x)=>a+x.m.positive,0)/metricRows.length),negative:Math.round(metricRows.reduce((a,x)=>a+x.m.negative,0)/metricRows.length)}:{positive:0,negative:0};avg.neutral=100-avg.positive-avg.negative;
  const themeRows=themes.map(t=>({label:t,value:selected.filter(p=>ciSocialThemes(p).includes(t)).length})).filter(x=>x.value).sort((a,b)=>b.value-a.value).slice(0,8);
  $('breadcrumbSmall').textContent='Competitive Intelligence / Social & Digital Media';$('breadcrumbTitle').textContent=currentDomain+' — Social & Digital';
  $('pageContent').innerHTML=ciPageHead("Social & Digital Media",'Directional monitoring of public social visibility, posting cadence, recurring topics and sentiment for companies in <b>'+esc(currentDomain)+'</b>. Metrics are demo estimates where platform APIs do not expose complete public history.')+
    '<section class="ci-filter-shell">'+ciFilterSelect("Company","company",["All companies",...names],s.company,"social-digital")+ciFilterSelect("Platform","platform",platforms,s.platform,"social-digital")+ciFilterSelect("Theme","theme",["All themes",...themes],s.theme,"social-digital")+ciFilterSelect("Time Period","period",["30 days","90 days","6 months","1 year"],s.period,"social-digital")+'</section>'+
    '<section class="section">'+ciSectionTitle("Digital activity snapshot","Estimated posting intensity and thematic visibility across the selected public-channel lens.","Directional demo estimate")+ '<div class="grid-3"><div class="card"><div class="card-title"><h3>Estimated posting frequency</h3><small>'+esc(s.period)+'</small></div>'+ciHorizontalBars(postRows)+'</div><div class="card"><div class="card-title"><h3>Sentiment mix</h3><small>Directional content tone</small></div>'+ciDonut([{label:"Positive",value:avg.positive},{label:"Neutral",value:avg.neutral},{label:"Negative / cautionary",value:avg.negative}])+'</div><div class="card"><div class="card-title"><h3>Most visible themes</h3></div>'+ciHorizontalBars(themeRows)+'</div></div></section>'+
    '<section class="section">'+ciSectionTitle("Company social intelligence","Platform links open public searches; topic analysis uses public profile/news evidence as a proxy where direct post history is inaccessible.","Public-search snapshot")+
      '<div class="ci-social-grid">'+selected.map(p=>{const m=ciSocialMetrics(p,s.platform,s.period),ts=ciSocialThemes(p);return '<article class="ci-social-card"><div class="ci-social-head">'+cpCompanyLogo(p.name)+'<div><h3>'+esc(p.name)+'</h3><p>'+esc((p.focusTags||[]).join(" · "))+'</p></div><b>'+m.engagement+'</b></div><div class="ci-social-kpis"><span><b>'+m.posts+'</b> estimated posts</span><span><b>'+m.positive+'%</b> positive</span><span><b>'+m.negative+'%</b> cautionary</span></div><div class="ci-social-themes">'+ts.map(t=>'<span>'+esc(t)+'</span>').join('')+'</div><div class="ci-social-signals"><b>Recent public-content signals</b>'+ciSocialContentSignals(p).map(n=>'<div><time>'+esc(n.date)+'</time><span>'+esc(n.title)+'</span></div>').join('')+'</div><div class="ci-social-links">'+["LinkedIn","YouTube","X","Instagram"].map(pl=>'<a href="'+ciSocialLink(pl,p.name)+'" target="_blank" rel="noopener">'+pl+' search ↗</a>').join('')+'</div></article>'}).join('')+'</div></section>'+
    '<section class="section"><div class="research-note"><strong>Method note:</strong> social platforms do not consistently expose complete public post histories without authenticated APIs. Posting frequency, engagement and sentiment values shown here are therefore directional prototype estimates; public search links are provided for manual validation. Newsroom themes and company positioning are used as a content proxy rather than presented as verbatim social posts.</div></section>';
}

/* -------- STRATEGY & MARKET POSITIONING -------- */
function ciStrategyValue(p,key){
  const map={business:p.strategy?.business,product:p.strategy?.product,channel:p.strategy?.channel,geographic:p.strategy?.geographic,digital:p.strategy?.digital,rd:p.strategy?.rd,expansion:p.strategy?.expansion};
  return map[key]||"Not separately disclosed.";
}
function ciStrategyScore2(p,key){
  if(p.demoIndexes){
    if(key==="digital"&&p.demoIndexes.digital!=null)return p.demoIndexes.digital;
    if(key==="product"&&p.demoIndexes.portfolio!=null)return p.demoIndexes.portfolio;
    if(key==="geographic"&&p.demoIndexes.global!=null)return p.demoIndexes.global;
    if(key==="rd"&&p.demoIndexes.innovation!=null)return p.demoIndexes.innovation;
  }
  const t=ciStrategyValue(p,key).toLowerCase();return ciPct(58+(ciHash(p.name+key)%22)+(t.length>100?10:0));
}
function ciPositionMatrix(profiles){
  const W=650,H=360,p=48;
  const points=profiles.map(x=>({p:x,x:ciStrategyScore2(x,"digital"),y:ciStrategyScore2(x,"rd")}));
  return '<div class="ci-position-map"><svg viewBox="0 0 '+W+' '+H+'"><line x1="'+p+'" y1="'+(H/2)+'" x2="'+(W-p)+'" y2="'+(H/2)+'" stroke="#d5dce0"/><line x1="'+(W/2)+'" y1="'+p+'" x2="'+(W/2)+'" y2="'+(H-p)+'" stroke="#d5dce0"/><text x="'+(W/2)+'" y="'+(H-8)+'" text-anchor="middle" font-size="11" fill="#6b7478">Digital / connected strategy →</text><text x="15" y="'+(H/2)+'" transform="rotate(-90 15 '+(H/2)+')" text-anchor="middle" font-size="11" fill="#6b7478">Innovation / R&D →</text>'+
    points.map(o=>{const xx=p+(o.x-50)/50*(W-2*p),yy=H-p-(o.y-50)/50*(H-2*p);return '<g><circle cx="'+xx+'" cy="'+yy+'" r="13" fill="#0076a8" fill-opacity=".16" stroke="#0076a8" stroke-width="2"/><circle cx="'+xx+'" cy="'+yy+'" r="5" fill="#0076a8"/><text x="'+xx+'" y="'+(yy-18)+'" text-anchor="middle" font-size="10" font-weight="800" fill="#003b5c">'+esc(o.p.name)+'</text></g>'}).join('')+'</svg><p class="ci-chart-note">Directional analyst map derived from loaded strategy evidence; not an external ranking.</p></div>';
}
function renderStrategyPositioningPage(){
  const s=ciIntelState["strategy-positioning"],profiles=ciProfiles(),names=ciNames(),regions=ciUnique(profiles.flatMap(p=>p.regions||[])),lensMap={"All strategic lenses":null,"Business":"business","Product":"product","Channel":"channel","Geographic":"geographic","Digital":"digital","R&D":"rd","Expansion":"expansion"};
  const selected=profiles.filter(p=>(s.company==="All companies"||p.name===s.company)&&(s.region==="All Regions"||(p.regions||[]).includes(s.region)));
  const keys=s.lens==="All strategic lenses"?["business","product","channel","geographic","digital","rd","expansion"]:[lensMap[s.lens]];
  const heatRows=selected.map(p=>({p,vals:keys.map(k=>({k,v:ciStrategyScore2(p,k)}))}));
  $('breadcrumbSmall').textContent='Competitive Intelligence / Strategy & Market Positioning';$('breadcrumbTitle').textContent=currentDomain+' — Strategy & Positioning';
  $('pageContent').innerHTML=ciPageHead("Strategy & Market Positioning",'Decode how competitors in <b>'+esc(currentDomain)+'</b> are allocating resources across product, channel, geography, digital, R&D and expansion—and where positioning is converging or diverging.')+
    '<section class="ci-filter-shell">'+ciFilterSelect("Company","company",["All companies",...names],s.company,"strategy-positioning")+ciFilterSelect("Region","region",["All Regions",...regions],s.region,"strategy-positioning")+ciFilterSelect("Strategic lens","lens",Object.keys(lensMap),s.lens,"strategy-positioning")+'<label>Positioning map<select disabled><option>Innovation × Digital</option></select></label></section>'+
    '<section class="section">'+ciSectionTitle("Competitive positioning map","Maps the selected competitive set by directional R&D / innovation emphasis and digital / connected strategy.","Directional analyst interpretation")+ '<div class="card">'+ciPositionMatrix(selected)+'</div></section>'+
    '<section class="section">'+ciSectionTitle("Strategic emphasis heatmap","Higher values indicate stronger emphasis in the loaded public strategy narrative—not superior performance.","Illustrative index")+ '<div class="card"><div class="table-scroll"><table class="data-table ci-heatmap"><thead><tr><th>Company</th>'+keys.map(k=>'<th>'+esc(k==="rd"?"R&D":k[0].toUpperCase()+k.slice(1))+'</th>').join('')+'</tr></thead><tbody>'+heatRows.map(r=>'<tr><td><strong>'+esc(r.p.name)+'</strong></td>'+r.vals.map(x=>'<td><span style="--heat:'+x.v+'">'+x.v+'</span></td>').join('')+'</tr>').join('')+'</tbody></table></div></div></section>'+
    '<section class="section">'+ciSectionTitle("Strategy cards","Evidence-backed narrative for each selected company, with implications and current watchpoints.","Company reporting + analyst synthesis")+
      '<div class="ci-strategy-company-grid">'+selected.map(p=>'<article class="card"><div class="ci-strategy-company-head">'+cpCompanyLogo(p.name)+'<div><h3>'+esc(p.name)+'</h3><p>'+esc((p.focusTags||[]).join(" · "))+'</p></div></div><div class="ci-strategy-lines">'+keys.map(k=>'<div><b>'+esc(k==="rd"?"R&D":k[0].toUpperCase()+k.slice(1))+'</b><p>'+esc(ciStrategyValue(p,k))+'</p></div>').join('')+'</div><div class="ci-watch"><b>Key watchpoints</b><p>'+esc((p.riskWatchpoints||["Execution against stated strategy","Competitive response","Market access / reimbursement"]).join(" · "))+'</p></div></article>').join('')+'</div></section>';
}

/* -------- CONFERENCE & KOL INTELLIGENCE -------- */
function ciConferenceData(){return (window.CI_CONFERENCE_RESEARCH&&CI_CONFERENCE_RESEARCH[currentDomain])||[]}
function ciConferenceFiltered(){
  const s=ciIntelState["conference-kol"];
  return ciConferenceData().filter(e=>(s.status==="All events"||e.status===s.status)&&(s.year==="All years"||e.start.slice(0,4)===s.year)&&(s.theme==="All themes"||(e.themes||[]).includes(s.theme)));
}
function ciConferenceRelevance(event,profile){
  if(!profile)return 0;
  const pwords=[...(profile.portfolioTags||[]),...(profile.focusTags||[]),...(profile.technology||[])].join(" ").toLowerCase();
  let hits=0;(event.themes||[]).forEach(t=>{const words=t.toLowerCase().split(/\s|\//).filter(x=>x.length>3);if(words.some(w=>pwords.includes(w)))hits++});
  return ciPct(52+hits*13+(ciHash(event.name+profile.name)%10));
}
function renderConferenceKOLPage(){
  const s=ciIntelState["conference-kol"],events=ciConferenceFiltered(),all=ciConferenceData(),themes=ciUnique(all.flatMap(e=>e.themes||[])),years=ciUnique(all.map(e=>e.start.slice(0,4))),names=ciNames(),profile=s.company==="All companies"?null:ciProfileByName(s.company);
  const quarterMap={};events.forEach(e=>{const d=ciDateVal(e.start),q=e.start.slice(0,4)+" Q"+(Math.floor(d.getMonth()/3)+1);quarterMap[q]=(quarterMap[q]||0)+1});
  const quarterRows=Object.entries(quarterMap).sort((a,b)=>a[0].localeCompare(b[0])).map(([label,value])=>({label,value}));
  const themeRows=themes.map(t=>({label:t,value:events.filter(e=>(e.themes||[]).includes(t)).length})).filter(x=>x.value).sort((a,b)=>b.value-a.value).slice(0,9);
  const kols=ciUnique(events.flatMap(e=>e.kols||[]));
  $('breadcrumbSmall').textContent='Competitive Intelligence / Conference & KOL Intelligence';$('breadcrumbTitle').textContent=currentDomain+' — Conference & KOL';
  $('pageContent').innerHTML=ciPageHead("Conference & KOL Intelligence",'Track past and upcoming scientific / industry meetings relevant to <b>'+esc(currentDomain)+'</b>, with dates, venues, themes, selected KOLs and company relevance.')+
    '<section class="ci-filter-shell">'+ciFilterSelect("Event status","status",["All events","Past","Upcoming"],s.status,"conference-kol")+ciFilterSelect("Theme","theme",["All themes",...themes],s.theme,"conference-kol")+ciFilterSelect("Year","year",["All years",...years],s.year,"conference-kol")+ciFilterSelect("Company relevance","company",["All companies",...names],s.company,"conference-kol")+'</section>'+
    '<section class="section">'+ciSectionTitle("Conference calendar intelligence","Volume, timing and thematic concentration of relevant meetings.","Official conference websites")+ '<div class="grid-3"><div class="card"><div class="card-title"><h3>Events by quarter</h3></div>'+ciHorizontalBars(quarterRows)+'</div><div class="card"><div class="card-title"><h3>Theme frequency</h3></div>'+ciHorizontalBars(themeRows)+'</div><div class="card"><div class="card-title"><h3>KOL / faculty watchlist</h3><small>Selected names from loaded event references</small></div><div class="ci-kol-list">'+kols.map(k=>'<span>'+esc(k)+'</span>').join('')+'</div><p class="ci-chart-note">Names reflect event leadership / faculty references where available; inclusion is not an endorsement.</p></div></div></section>'+
    '<section class="section">'+ciSectionTitle("Conference detail","Official dates and venue, key themes, selected faculty / KOL names and strategic relevance.","Past + upcoming events")+
      '<div class="ci-conference-grid">'+events.map(e=>'<article class="ci-conference-card"><div class="ci-conf-top"><span class="'+e.status.toLowerCase()+'">'+esc(e.status)+'</span><time>'+esc(e.start)+(e.end&&e.end!==e.start?' → '+esc(e.end):'')+'</time></div><h3>'+esc(e.name)+'</h3><p class="venue">'+esc(e.venue)+'</p><p>'+esc(e.summary)+'</p><div class="ci-social-themes">'+(e.themes||[]).map(t=>'<span>'+esc(t)+'</span>').join('')+'</div>'+(profile?'<div class="ci-conf-relevance"><b>'+ciConferenceRelevance(e,profile)+'</b><span>'+esc(profile.name)+' relevance index</span></div>':'')+'<div class="ci-conf-kol"><b>Selected KOL / faculty</b><p>'+esc((e.kols||[]).join(" · "))+'</p></div><a href="'+e.url+'" target="_blank" rel="noopener">Open official conference website ↗</a></article>').join('')+'</div></section>';
}

function ciUnique(arr){return [...new Set(arr.filter(Boolean))].sort((a,b)=>String(a).localeCompare(String(b)))}
function renderCIIntelligence(id){
  ciEnsureState(id);
  if(id==="news-alerts")return renderNewsAlertsPage();
  if(id==="product-portfolio")return renderProductPortfolioPage();
  if(id==="ma-partnerships")return renderMAPage();
  if(id==="social-digital")return renderSocialDigitalPage();
  if(id==="strategy-positioning")return renderStrategyPositioningPage();
  if(id==="conference-kol")return renderConferenceKOLPage();
}