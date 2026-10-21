/* Knowledge Repository — document hub and connector prototype */
let repositoryState={type:"All document types",workstream:"All workstreams",source:"All sources",search:""};
let repositoryUploads=[];
let repositoryConnections={};

function repoDomainDocs(){
  const docs=[],pmr=(window.PMR_DEMO_DATA&&PMR_DEMO_DATA[currentDomain])||null,news=(window.CI_NEWS_RESEARCH&&CI_NEWS_RESEARCH[currentDomain])||[],ex=(window.EXECUTIVE_HUB_DATA&&EXECUTIVE_HUB_DATA[currentDomain])||null;
  (pmr?.projects||[]).forEach((p,i)=>docs.push({
    id:"pmr-"+i,title:p.name+" — "+(p.status==="Completed"?"Final report":p.status+" working file"),type:p.status==="Completed"?"Final report":"Working file",
    workstream:"Primary Market Research",source:"Abbott PMR",date:p.end||p.period,owner:p.owner||"PMR team",format:p.status==="Completed"?"PPTX":"XLSX / PPTX",
    status:p.status==="Completed"?"Indexed":"Active",description:p.purpose,route:{type:"pmr",id:p.type.includes("Quantitative")?"quant-surveys":p.type.includes("Expert")?"expert-interviews":"voc"}
  }));
  docs.push(
    {id:"industry",title:currentDomain+" — Industry overview & market landscape",type:"Market report",workstream:"Industry Overview",source:"Abbott synthesis",date:"2026-09-18",owner:"MedTech strategy team",format:"Dashboard",status:"Indexed",description:"Market size, growth, regional opportunity, segments, key players, dynamics, risks and strategic opportunities.",route:{type:"industry"}},
    {id:"ci-profile",title:currentDomain+" — Competitive company profiles",type:"Competitive intelligence",workstream:"Competitive Intelligence",source:"Abbott CI",date:"2026-09-18",owner:"CI team",format:"Dashboard",status:"Indexed",description:"Company profiles, financials, product portfolio, strategic direction, M&A and regional presence.",route:{type:"ci",id:"company-profiles"}},
    {id:"ci-news",title:currentDomain+" — News & alerts intelligence feed",type:"Competitive intelligence",workstream:"Competitive Intelligence",source:"Public web + Abbott CI",date:"2026-09-18",owner:"CI team",format:"Dashboard",status:"Indexed",description:"Curated one-year company, regulatory, product, clinical and transaction intelligence.",route:{type:"ci",id:"news-alerts"}}
  );
  (news||[]).slice(0,8).forEach((n,i)=>docs.push({
    id:"web-"+i,title:n.title,type:"External source",workstream:"Competitive Intelligence",source:n.source||"Public web",date:n.date,owner:n.company,format:"Web",status:"Linked",description:n.summary,url:n.url
  }));
  (ex?.sources||[]).slice(0,6).forEach((s,i)=>docs.push({
    id:"source-"+i,title:s.title||("Industry source "+(i+1)),type:"External source",workstream:"Industry Overview",source:"Public / market source",date:s.date||"Current",owner:"External source",format:"Web",status:"Linked",description:s.fact||"Supporting source used in the Industry Overview.",url:s.url
  }));
  return docs;
}
function repoTypes(docs){return ["All document types",...pmrUnique(docs.map(d=>d.type))]}
function repoWorkstreams(docs){return ["All workstreams",...pmrUnique(docs.map(d=>d.workstream))]}
function repoSources(docs){return ["All sources",...pmrUnique(docs.map(d=>d.source))]}
function updateRepositoryFilter(key,value){repositoryState[key]=value;renderKnowledgeRepository()}
function updateRepositorySearch(value){
  repositoryState.search=value;
  const rows=repositoryFilteredDocs(),results=$('repositoryResults'),count=$('repositoryResultCount');
  if(results)results.innerHTML=repoDocumentCards(rows);
  if(count)count.textContent=rows.length+" assets";
}
function repositoryFilteredDocs(){
  const q=(repositoryState.search||"").toLowerCase();
  return repoDomainDocs().filter(d=>
    (repositoryState.type==="All document types"||d.type===repositoryState.type)&&
    (repositoryState.workstream==="All workstreams"||d.workstream===repositoryState.workstream)&&
    (repositoryState.source==="All sources"||d.source===repositoryState.source)&&
    (!q||(d.title+" "+d.description+" "+d.owner+" "+d.source).toLowerCase().includes(q))
  );
}
function repoSelect(label,key,values,value){
  return '<label>'+esc(label)+'<select onchange="updateRepositoryFilter(\''+key+'\',this.value)">'+values.map(v=>'<option '+(v===value?'selected':'')+'>'+esc(v)+'</option>').join('')+'</select></label>';
}
function openRepositoryDocument(id){
  const d=repoDomainDocs().find(x=>x.id===id);if(!d)return;
  if(d.url){window.open(d.url,"_blank","noopener");return}
  if(d.route)navigate(d.route.type,d.route.id);
}
function repoDocumentCards(rows){
  if(!rows.length)return '<div class="ci-empty">No documents match the current filters.</div>';
  return '<div class="repository-doc-grid">'+rows.map(d=>'<article><div class="repo-doc-icon">'+esc(d.format==="Web"?"↗":d.format==="Dashboard"?"▦":"▤")+'</div><div class="repo-doc-main"><div class="repo-doc-meta"><span>'+esc(d.type)+'</span><span>'+esc(d.workstream)+'</span><span class="repo-status '+d.status.toLowerCase()+'">'+esc(d.status)+'</span></div><h3>'+esc(d.title)+'</h3><p>'+esc(d.description)+'</p><div class="repo-doc-foot"><small>'+esc(d.source)+' · '+esc(d.date)+' · '+esc(d.format)+'</small><button onclick="openRepositoryDocument(\''+d.id+'\')">'+(d.url?"Open source ↗":"Open →")+'</button></div></div></article>').join('')+'</div>';
}
function handleRepositoryUpload(input){
  const files=[...(input.files||[])];if(!files.length)return;
  files.forEach(f=>repositoryUploads.unshift({name:f.name,size:f.size,type:f.type||"Unknown",date:new Date().toLocaleDateString(),id:"upl-"+Date.now()+"-"+Math.random().toString(16).slice(2)}));
  renderKnowledgeRepository();showToast(files.length+" file"+(files.length>1?"s":"")+" added to the prototype upload queue.");
}
function repoUploadedFiles(){
  if(!repositoryUploads.length)return '<div class="repo-upload-empty">No local files selected in this session.</div>';
  return '<div class="repo-upload-list">'+repositoryUploads.map(f=>'<article><span>▤</span><div><strong>'+esc(f.name)+'</strong><small>'+Math.max(1,Math.round(f.size/1024))+' KB · '+esc(f.type)+' · '+esc(f.date)+'</small></div><em>Queued for indexing</em></article>').join('')+'</div>';
}
function toggleRepositoryConnector(name){
  repositoryConnections[name]=!repositoryConnections[name];renderKnowledgeRepository();showToast(name+(repositoryConnections[name]?" connected in prototype mode.":" disconnected."));
}
function repoConnectorCards(){
  return '<div class="repository-connectors">'+(window.REPOSITORY_CONNECTORS||[]).map(c=>'<article class="'+(repositoryConnections[c.name]?"connected":"")+'"><div class="repo-connector-icon">'+esc(c.icon)+'</div><div><span>'+esc(c.type)+'</span><h3>'+esc(c.name)+'</h3><p>'+esc(c.note)+'</p></div><div class="repo-connector-actions"><button onclick="toggleRepositoryConnector(\''+c.name.replace(/'/g,"\\'")+'\')">'+(repositoryConnections[c.name]?"Connected ✓":"Connect")+'</button>'+(c.url&&c.url!=="#"?'<a href="'+c.url+'" target="_blank" rel="noopener">Provider ↗</a>':'')+'</div></article>').join('')+'</div>';
}
function renderKnowledgeRepository(){
  const docs=repoDomainDocs(),rows=repositoryFilteredDocs();
  $('breadcrumbSmall').textContent='Abbott 360 / Knowledge Repository';$('breadcrumbTitle').textContent=currentDomain+' — Evidence & document hub';
  $('pageContent').innerHTML=
    '<section class="hero repository-hero"><div class="hero-grid"><div><div class="kicker" style="color:#8ee1f5">Knowledge Repository · '+esc(currentDomain)+'</div><h1>One governed hub for research evidence</h1><p>Find project reports, transcripts, survey outputs, competitive intelligence, industry sources and uploaded working files in one place, with direct access to the underlying evidence.</p></div><div class="repo-hero-kpis"><article><b>'+docs.length+'</b><span>Available / linked assets</span></article><article><b>'+docs.filter(d=>d.status==="Indexed").length+'</b><span>Indexed assets</span></article><article><b>'+(window.REPOSITORY_CONNECTORS||[]).length+'</b><span>Connector options</span></article><article><b>'+repositoryUploads.length+'</b><span>Local files queued</span></article></div></div></section>'+
    '<section class="section exec-section-first"><div class="section-head"><div><h2>Document library</h2><p>Filter the domain repository and open the relevant internal dashboard or original public source directly.</p></div></div>'+
      '<div class="repository-filter-shell"><label class="repo-search-label">Search repository<input value="'+esc(repositoryState.search)+'" oninput="updateRepositorySearch(this.value)" placeholder="Search reports, projects, companies, themes..." /></label>'+
      repoSelect("Document type","type",repoTypes(docs),repositoryState.type)+repoSelect("Workstream","workstream",repoWorkstreams(docs),repositoryState.workstream)+repoSelect("Source","source",repoSources(docs),repositoryState.source)+'</div>'+
      '<div class="repository-result-head"><strong id="repositoryResultCount">'+rows.length+' assets</strong><span>'+esc(currentDomain)+'</span></div><div id="repositoryResults">'+repoDocumentCards(rows)+'</div></section>'+
    '<section class="section"><div class="section-head"><div><h2>Upload from local system</h2><p>Add research reports, transcripts, survey data, competitor files or working documents for future indexing and analysis.</p></div><span class="pmr-demo-badge small">Browser-session prototype</span></div>'+
      '<div class="repository-upload"><label class="repo-dropzone"><input type="file" multiple onchange="handleRepositoryUpload(this)" accept=".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.csv,.txt,.json" /><div class="repo-upload-icon">↑</div><strong>Choose files from your computer</strong><p>PDF, PowerPoint, Word, Excel, CSV, TXT and JSON are represented in the prototype.</p><span>Select files</span></label><div class="repo-upload-queue"><h3>Upload queue</h3>'+repoUploadedFiles()+'</div></div></section>'+
    '<section class="section"><div class="section-head"><div><h2>Connect external repositories & intelligence sources</h2><p>Connector cards represent the target ingestion architecture for governed cloud, competitive, social and scientific sources.</p></div><span class="assistant-evidence-badge">OAuth / API wiring required for live ingestion</span></div>'+repoConnectorCards()+'</section>'+
    '<section class="section"><div class="grid-3"><div class="card"><div class="card-title"><h3>Ingestion workflow</h3><small>Target operating model</small></div><div class="repo-flow"><span>1</span><strong>Connect / upload</strong><i>→</i><span>2</span><strong>Extract & classify</strong><i>→</i><span>3</span><strong>Index & permission</strong><i>→</i><span>4</span><strong>Analyze & cite</strong></div></div><div class="card"><div class="card-title"><h3>Governance controls</h3><small>Recommended production controls</small></div><div class="deliverable-list"><div class="deliverable-item"><div class="qnum">1</div><span>Source-level permissions and role-based access.</span></div><div class="deliverable-item"><div class="qnum">2</div><span>File version, ingestion date and document-owner metadata.</span></div><div class="deliverable-item"><div class="qnum">3</div><span>Citation back to the exact document or public source.</span></div></div></div><div class="card"><div class="card-title"><h3>Analysis-ready metadata</h3><small>Suggested fields</small></div><div class="repo-tags"><span>Domain</span><span>Project</span><span>Workstream</span><span>Company</span><span>Market</span><span>Persona</span><span>Theme</span><span>Date</span><span>Source</span><span>Confidentiality</span></div></div></div></section>';
}