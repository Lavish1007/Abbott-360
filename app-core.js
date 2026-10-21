const DOMAIN_NAME_MAP = {
  "Autoimmunity & Allergy":"Immunodiagnostics",
  "Diabetes & Blood Glucose Monitoring":"Diabetes Monitoring & Blood Glucose Monitoring",
  "Ophthalmology":"Eye Health",
  "Ophthalmology & Eye Health":"Eye Health",
  "Orthopedics":"Orthopedics & Sports medicine",
  "Orthopedics & Sports Medicine":"Orthopedics & Sports medicine",
  "Advanced Wound Management":"Advanced wound management",
  "Clinical Laboratory Services":"Clinical laboratory services"
};
const BUSINESS_ROLES = {
  "Executive Leadership Team":{short:"Executive Leadership",assistant:"Executive strategy advisor",focus:"enterprise growth, portfolio performance, strategic risk, major competitive moves and decisions",ci:["news-alerts","company-profiles"],pmr:["voc"]},
  "Product & Portfolio Management Team":{short:"Product & Portfolio",assistant:"Product and portfolio intelligence advisor",focus:"portfolio attractiveness, product gaps, lifecycle opportunities, feature benchmarks, customer needs and innovation priorities",ci:["product-portfolio","company-profiles"],pmr:["voc"]},
  "Marketing, Branding & Commercial Excellence Team":{short:"Marketing & Commercial Excellence",assistant:"Commercial excellence intelligence advisor",focus:"positioning, messaging, customer segments, pricing, reimbursement, channel strategy and commercial performance",ci:["commercial-gtm","company-profiles"],pmr:["voc"]},
  "Strategy & Business Development Team":{short:"Strategy & Business Development",assistant:"Strategy and business development advisor",focus:"market attractiveness, adjacencies, partnerships, M&A, competitor strategy and growth opportunities",ci:["news-alerts","company-profiles"],pmr:["voc"]},
  "Medical & Clinical Affairs, R&D & Innovation Team":{short:"Medical, Clinical & R&D",assistant:"Medical, clinical and innovation intelligence advisor",focus:"clinical evidence, unmet needs, emerging technology, workflow gaps, innovation signals and research priorities",ci:["product-portfolio","news-alerts"],pmr:["voc"]}
};
function applyDomainAliases(){
  const stores=["DOMAIN_DATA","DOMAIN_ENRICHMENT","DOMAIN_EVIDENCE","EXECUTIVE_DAILY_DATA","EXECUTIVE_STRATEGY_DATA","EXECUTIVE_HUB_DATA","CI_NEWS_RESEARCH","CI_NEWS_EXTRA","CI_NEWS_MORE_1","CI_NEWS_MORE_2","PMR_DOMAIN_CONFIG","PMR_DEMO_DATA","PMR_V2_CONFIG","COMPANY_PROFILES"];
  stores.forEach(name=>{const store=window[name];if(!store)return;Object.entries(DOMAIN_NAME_MAP).forEach(([oldName,newName])=>{if(store[oldName]&&!store[newName])store[newName]=store[oldName];});});
  Object.keys(DOMAIN_NAME_MAP).forEach(oldName=>{if(DOMAIN_DATA[oldName])delete DOMAIN_DATA[oldName];});
}
applyDomainAliases();
let currentRole = localStorage.getItem('abbott360Role') || 'Viewer';
let currentBusinessRole = localStorage.getItem('abbott360BusinessRole') || 'Executive Leadership Team';
let storedDomain = localStorage.getItem('abbott360Domain');
let currentDomain = DOMAIN_NAME_MAP[storedDomain] || storedDomain || Object.keys(DOMAIN_DATA)[0];
let currentPage = {type:'executive'};
let globalFilters = {company:'All companies', theme:'All themes', dataset:'All datasets'};

function $(id){return document.getElementById(id)}
function esc(s){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function showToast(msg){const t=$('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200)}
function credentialLogin(){if($('email').value.trim()==='demo@abbott360.example'&&$('password').value==='Abbott360')goRoleSelection();else showToast('Use the prototype credentials shown below the form.')}
function hideOnboarding(){['roleScreen','domainScreen','accessScreen'].forEach(id=>{if($(id))$(id).classList.add('hidden')})}
function goRoleSelection(){hideOnboarding();$('loginScreen').classList.add('hidden');$('roleScreen').classList.remove('hidden')}
function chooseBusinessRole(role){currentBusinessRole=role;localStorage.setItem('abbott360BusinessRole',role);$('roleScreen').classList.add('hidden');$('domainScreen').classList.remove('hidden');renderDomainSelectors()}
function goBackToRole(){hideOnboarding();$('roleScreen').classList.remove('hidden')}
function continueToAccess(){localStorage.setItem('abbott360Domain',currentDomain);$('domainScreen').classList.add('hidden');$('accessScreen').classList.remove('hidden')}
function goBackToDomain(){hideOnboarding();$('domainScreen').classList.remove('hidden');renderDomainSelectors()}
function chooseAccessType(role){currentRole=role;localStorage.setItem('abbott360Role',role);localStorage.setItem('abbott360BusinessRole',currentBusinessRole);localStorage.setItem('abbott360Domain',currentDomain);hideOnboarding();$('appScreen').classList.remove('hidden');initializeApp();navigate('executive')}
function chooseRole(role){chooseAccessType(role)}
function logout(){localStorage.removeItem('abbott360Role');localStorage.removeItem('abbott360BusinessRole');localStorage.removeItem('abbott360Domain');$('appScreen').classList.add('hidden');hideOnboarding();$('loginScreen').classList.remove('hidden');currentPage={type:'executive'};window.location.hash=''}

function enrichment(){return (window.DOMAIN_ENRICHMENT&&DOMAIN_ENRICHMENT[currentDomain])||{}}
function renderDomainSelectors(){
  const names=Object.keys(DOMAIN_DATA); const opts=names.map(n=>'<option '+(n===currentDomain?'selected':'')+'>'+esc(n)+'</option>').join('');
  $('roleDomainSelect').innerHTML=opts;
  $('domainGrid').innerHTML=names.map(n=>{const d=DOMAIN_DATA[n];return '<button class="domain-card '+(n===currentDomain?'selected':'')+'" onclick="selectDomain(\''+n.replace(/'/g,"\\'")+'\')"><span class="dc-icon">'+d.icon+'</span><strong>'+esc(n)+'</strong><span>'+esc(d.opportunities.slice(0,2).join(' • '))+'</span></button>'}).join('');
}
function selectDomain(name){currentDomain=name;$('roleDomainSelect').value=name;renderDomainSelectors()}
function initializeApp(){
  const roleCfg=BUSINESS_ROLES[currentBusinessRole]||BUSINESS_ROLES["Executive Leadership Team"];
  if($('sideBusinessRole'))$('sideBusinessRole').textContent=roleCfg.short;
  if($('sideAccessType'))$('sideAccessType').textContent=currentRole+' access';
  if($('navExecutive'))$('navExecutive').querySelector('span:last-child').textContent=roleCfg.short+' Hub';
  $('sideDomain').textContent=currentDomain;
  $('avatarLabel').textContent=currentRole==='Hub Owner'?'HO':currentRole==='Contributor'?'CO':'VI';
  const opts=Object.keys(DOMAIN_DATA).map(n=>'<option '+(n===currentDomain?'selected':'')+'>'+esc(n)+'</option>').join('');$('topDomainSelect').innerHTML=opts;
  $('ciSubmenu').innerHTML=CI_SUBSEGMENTS.map(x=>'<button class="subnav-btn '+(roleCfg.ci.includes(x.id)?'role-priority':'')+'" data-route="ci/'+x.id+'" onclick="navigate(\'ci\',\''+x.id+'\')">'+esc(x.title)+(roleCfg.ci.includes(x.id)?'<span>Priority</span>':'')+'</button>').join('');
  $('pmrSubmenu').innerHTML=PMR_SUBSEGMENTS.map(x=>'<button class="subnav-btn '+(roleCfg.pmr.includes(x.id)?'role-priority':'')+'" data-route="pmr/'+x.id+'" onclick="navigate(\'pmr\',\''+x.id+'\')">'+esc(x.title)+(roleCfg.pmr.includes(x.id)?'<span>Priority</span>':'')+'</button>').join('');
  applyAccessMode();
  refreshGlobalFilters();
}
function applyAccessMode(){
  const btn=$('accessActionBtn');if(!btn)return;
  if(currentRole==='Hub Owner'){btn.textContent='Manage hub';btn.className='access-action-btn owner';}
  else if(currentRole==='Contributor'){btn.textContent='Add intelligence';btn.className='access-action-btn contributor';}
  else{btn.textContent='Read-only mode';btn.className='access-action-btn viewer';}
}
function handleAccessAction(){
  if(currentRole==='Hub Owner')showToast('Hub Owner controls enabled in this prototype workspace.');
  else if(currentRole==='Contributor')showToast('Contributor mode: add/upload workflows are represented in this prototype.');
  else showToast('Viewer access is read-only.');
}
function businessRoleConfig(){return BUSINESS_ROLES[currentBusinessRole]||BUSINESS_ROLES["Executive Leadership Team"]}
function switchDomain(name){
  currentDomain=name;localStorage.setItem('abbott360Domain',name);$('sideDomain').textContent=name;
  globalFilters.company='All companies';globalFilters.theme='All themes';
  refreshGlobalFilters();renderCurrentPage()
}
function refreshGlobalFilters(){
  const d=DOMAIN_DATA[currentDomain],en=enrichment();
  const companies=(en.competitors&&en.competitors.length)?en.competitors:d.players.map(p=>p.name);
  const themes=(en.themes&&en.themes.length)?en.themes:[...d.opportunities,...d.dynamics.map(x=>x.title)];
  if($('companyFilter'))$('companyFilter').innerHTML=['All companies',...companies].map(x=>'<option '+(x===globalFilters.company?'selected':'')+'>'+esc(x)+'</option>').join('');
  if($('themeFilter'))$('themeFilter').innerHTML=['All themes',...themes].map(x=>'<option '+(x===globalFilters.theme?'selected':'')+'>'+esc(x)+'</option>').join('');
  if($('datasetFilter'))$('datasetFilter').innerHTML=['All datasets','Public market data','Competitive signals','PMR blueprint','Illustrative demo'].map(x=>'<option '+(x===globalFilters.dataset?'selected':'')+'>'+x+'</option>').join('');
  renderFilterRibbon();
}
function updateGlobalFilter(key,value){globalFilters[key]=value;renderFilterRibbon();renderCurrentPage()}
function resetGlobalFilters(){globalFilters={company:'All companies',theme:'All themes',dataset:'All datasets'};refreshGlobalFilters();renderCurrentPage()}
function renderFilterRibbon(){
  if(!$('filterRibbon'))return;
  const active=[];
  if(globalFilters.company!=='All companies')active.push('Company: '+globalFilters.company);
  if(globalFilters.theme!=='All themes')active.push('Theme: '+globalFilters.theme);
  if(globalFilters.dataset!=='All datasets')active.push('Dataset: '+globalFilters.dataset);
  $('filterRibbon').innerHTML='<div><strong>Global filters</strong><span>'+esc(globalFilters.company)+'</span><span>'+esc(globalFilters.theme)+'</span><span>'+esc(globalFilters.dataset)+'</span></div>'+(active.length?'<button onclick="resetGlobalFilters()">Reset filters</button>':'<small>Use the dropdowns above to scope companies, themes and evidence layers.</small>');
}
function activeFilterNote(){
  const a=[];
  if(globalFilters.company!=='All companies')a.push('Company = '+globalFilters.company);
  if(globalFilters.theme!=='All themes')a.push('Theme = '+globalFilters.theme);
  if(globalFilters.dataset!=='All datasets')a.push('Dataset = '+globalFilters.dataset);
  return a.length?'<div class="active-filter-note"><strong>View scoped by:</strong> '+esc(a.join(' • '))+'</div>':'';
}
function filteredPlayers(d){
  if(globalFilters.company==='All companies')return d.players;
  const q=globalFilters.company.toLowerCase();
  const hits=d.players.filter(p=>p.name.toLowerCase().includes(q)||q.includes(p.name.toLowerCase()));
  return hits.length?hits:d.players;
}
function filteredSignals(){
  const en=enrichment(),signals=en.signals||[];
  return signals.filter(s=>{
    const companyOk=globalFilters.company==='All companies'||String(s.company||'').toLowerCase().includes(globalFilters.company.toLowerCase())||globalFilters.company.toLowerCase().includes(String(s.company||'').toLowerCase())||s.company==='Category';
    const themeOk=globalFilters.theme==='All themes'||(s.title+' '+s.detail+' '+s.type).toLowerCase().includes(globalFilters.theme.toLowerCase().split(' / ')[0]);
    return companyOk&&themeOk;
  });
}
function openSegment(type){
  const parent=$(type==='ci'?'navCi':'navPmr'),sub=$(type==='ci'?'ciSubmenu':'pmrSubmenu');
  const willOpen=!sub.classList.contains('open');
  document.querySelectorAll('.submenu').forEach(x=>{if(x!==sub)x.classList.remove('open')});
  document.querySelectorAll('.nav-parent').forEach(x=>{if(x!==parent)x.classList.remove('open')});
  sub.classList.toggle('open',willOpen);
  parent.classList.toggle('open',willOpen);
  navigate(type);
}
function setActiveNav(type,id){
  document.querySelectorAll('.nav-btn,.nav-parent,.subnav-btn').forEach(x=>x.classList.remove('active'));
  if(type==='executive'){
    if($('navExecutive'))$('navExecutive').classList.add('active');
    document.querySelectorAll('.submenu').forEach(x=>x.classList.remove('open'));
    document.querySelectorAll('.nav-parent').forEach(x=>x.classList.remove('open'));
  }
  if(type==='industry'){
    if($('navIndustry'))$('navIndustry').classList.add('active');
    document.querySelectorAll('.submenu').forEach(x=>x.classList.remove('open'));
    document.querySelectorAll('.nav-parent').forEach(x=>x.classList.remove('open'));
  }
  if(type==='repository'){
    if($('navRepository'))$('navRepository').classList.add('active');
    document.querySelectorAll('.submenu').forEach(x=>x.classList.remove('open'));
    document.querySelectorAll('.nav-parent').forEach(x=>x.classList.remove('open'));
  }
  if(type==='ci'){
    $('navCi').classList.add('active');
    if(id){
      $('ciSubmenu').classList.add('open');$('navCi').classList.add('open');
      $('pmrSubmenu').classList.remove('open');$('navPmr').classList.remove('open');
    }
  }
  if(type==='pmr'){
    $('navPmr').classList.add('active');
    if(id){
      $('pmrSubmenu').classList.add('open');$('navPmr').classList.add('open');
      $('ciSubmenu').classList.remove('open');$('navCi').classList.remove('open');
    }
  }
  if(id){const el=document.querySelector('[data-route="'+type+'/'+id+'"]');if(el)el.classList.add('active')}
}
function navigate(type,id){currentPage={type,id};window.location.hash=id?type+'/'+id:type;setActiveNav(type,id);renderCurrentPage();window.scrollTo({top:0,behavior:'smooth'})}
function renderCurrentPage(){
  if(currentPage.type==='executive')renderExecutiveHub();
  else if(currentPage.type==='industry')renderIndustryOverview();
  else if(currentPage.type==='repository')renderKnowledgeRepository();
  else if(!currentPage.id)renderSegmentOverview(currentPage.type);
  else renderSubsegment(currentPage.type,currentPage.id)
}

function lineChart(values,labels){const W=560,H=210,p=28,max=Math.max(...values)+5,min=Math.min(...values)-5;const pts=values.map((v,i)=>{const x=p+i*(W-p*2)/(values.length-1),y=H-p-(v-min)*(H-p*2)/(max-min);return [x,y]}),poly=pts.map(a=>a.join(',')).join(' ');return '<svg viewBox="0 0 '+W+' '+H+'" aria-label="Indexed trend chart"><g stroke="#e8edef" stroke-width="1">'+[0,1,2,3].map(i=>'<line x1="'+p+'" y1="'+(40+i*40)+'" x2="'+(W-p)+'" y2="'+(40+i*40)+'"/>').join('')+'</g><polyline fill="none" stroke="#003b5c" stroke-width="4" points="'+poly+'"/><polyline fill="none" stroke="#0076a8" stroke-width="9" opacity=".08" points="'+poly+'"/>'+pts.map((a,i)=>'<circle cx="'+a[0]+'" cy="'+a[1]+'" r="5" fill="#0076a8"/><text x="'+a[0]+'" y="'+(H-7)+'" text-anchor="middle" font-size="13" fill="#6d7579">'+labels[i]+'</text><text x="'+a[0]+'" y="'+(a[1]-10)+'" text-anchor="middle" font-size="12" font-weight="700" fill="#003b5c">'+values[i]+'</text>').join('')+'</svg>'}
function marketBarChart(m){
  if(!m)return '';
  const max=Math.max(m.current,m.forecast),w1=Math.max(8,Math.round(m.current/max*100)),w2=100;
  return '<div class="market-bars"><div class="market-bar-row"><span>'+m.currentYear+'</span><div><i style="width:'+w1+'%"></i></div><b>$'+m.current.toFixed(2)+'B</b></div><div class="market-bar-row"><span>'+m.forecastYear+'</span><div><i style="width:'+w2+'%"></i></div><b>$'+m.forecast.toFixed(2)+'B</b></div></div><div class="market-caption"><strong>'+m.cagr+'% CAGR</strong><span>'+esc(m.region)+'</span></div>';
}
function sourcesHtml(d){
  const ev=(window.DOMAIN_EVIDENCE&&DOMAIN_EVIDENCE[currentDomain])||{},en=enrichment();
  const combined=[...(ev.sources||[]),...(en.sources||[]),...(d.sources||[])];
  const seen=new Set();
  const unique=combined.filter(s=>{const k=s.url||s.title;if(seen.has(k))return false;seen.add(k);return true});
  return '<div class="source-list">'+unique.map(s=>'<div class="source-item"><a href="'+s.url+'" target="_blank" rel="noopener">'+esc(s.title)+' ↗</a>'+(s.fact?'<p>'+esc(s.fact)+'</p>':'')+(s.date?'<div class="source-date">'+esc(s.date)+'</div>':'')+'</div>').join('')+'</div>';
}
function pageFacts(d){
  const ev=(window.DOMAIN_EVIDENCE&&DOMAIN_EVIDENCE[currentDomain])||{};
  const facts=(ev.facts&&ev.facts.length)?ev.facts:d.metrics;
  return '<div class="fact-grid">'+facts.map(m=>'<div class="fact-card"><div class="flabel">'+esc(m.label)+'</div><div class="fvalue">'+esc(m.value)+'</div><div class="fnote">'+esc(m.note)+(m.source!==undefined?' <span class="source-chip">S'+(m.source+1)+'</span>':'')+'</div></div>').join('')+'</div>';
}
