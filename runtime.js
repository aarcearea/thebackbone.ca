/* The Backbone site runtime: renders the page template and keeps it interactive. */
(function(){
  class DCLogic{constructor(p){this.props=p||{};this.state={}}
    setState(o){Object.assign(this.state,typeof o==='function'?o(this.state):o);schedule()}}
  window.DCLogic=DCLogic;
  var comp,tpl,root,pending=false;
  function ev(expr,scope){try{return new Function('s','with(s){return ('+expr+')}')(scope)}catch(e){return ''}}
  function interp(str,scope){var m=str.match(/^\s*\{\{([\s\S]*?)\}\}\s*$/);if(m)return ev(m[1],scope);
    return str.replace(/\{\{([\s\S]*?)\}\}/g,function(_,e){var v=ev(e,scope);return v==null?'':v})}
  function build(node,scope,out){
    Array.prototype.forEach.call(node.childNodes,function(n){
      if(n.nodeType===3){out.appendChild(document.createTextNode(String(interp(n.nodeValue,scope))));return}
      if(n.nodeType!==1)return;
      var tag=n.localName;
      if(tag==='helmet')return;
      if(tag==='sc-for'){var list=interp(n.getAttribute('list'),scope)||[],as=n.getAttribute('as')||'item';
        list.forEach(function(it,i){var s=Object.create(scope);s[as]=it;s.index=i;build(n,s,out)});return}
      if(tag==='sc-if'){if(interp(n.getAttribute('value'),scope))build(n,scope,out);return}
      var el=n.namespaceURI==='http://www.w3.org/1999/xhtml'?document.createElement(tag):document.createElementNS(n.namespaceURI,tag);
      el.__h={};
      Array.prototype.forEach.call(n.attributes,function(a){
        if(/^on[a-z]+$/i.test(a.name)){var f=interp(a.value,scope);if(typeof f==='function')el.__h[a.name.slice(2).toLowerCase()]=f;return}
        if(a.name.indexOf('hint-')===0)return;
        var v=interp(a.value,scope);if(v===false||v==null)return;if(v===true)v='';el.setAttribute(a.name,String(v))});
      build(n.content||n,scope,el);out.appendChild(el)})}
  function morph(a,b){
    var ac=a.childNodes,bc=Array.prototype.slice.call(b.childNodes);
    for(var i=0;i<bc.length;i++){var o=ac[i],n=bc[i];
      if(!o){a.appendChild(n);continue}
      if(o.nodeType!==n.nodeType||(o.nodeType===1&&o.localName!==n.localName)){a.replaceChild(n,o);continue}
      if(o.nodeType===3){if(o.nodeValue!==n.nodeValue)o.nodeValue=n.nodeValue;continue}
      if(o.nodeType!==1)continue;
      Array.prototype.slice.call(o.attributes).forEach(function(at){if(!n.hasAttribute(at.name))o.removeAttribute(at.name)});
      Array.prototype.forEach.call(n.attributes,function(at){if(o.getAttribute(at.name)!==at.value)o.setAttribute(at.name,at.value)});
      o.__h=n.__h;morph(o,n)}
    while(ac.length>bc.length)a.removeChild(a.lastChild)}
  function render(){pending=false;var vals=comp.renderVals(),f=document.createElement('div');build(tpl,vals,f);
    if(!root.firstChild){while(f.firstChild)root.appendChild(f.firstChild)}else morph(root,f)}
  function schedule(){if(!pending){pending=true;requestAnimationFrame(render)}}
  ['click','input','submit','change'].forEach(function(t){document.addEventListener(t,function(e){
    for(var el=e.target;el&&el!==document;el=el.parentNode){if(el.__h&&el.__h[t]){el.__h[t](e);break}}},true)});
  window.__boot=function(C,props){
    tpl=document.getElementById('tpl').content;
    root=document.getElementById('app');comp=new C(props);render();
    if(comp.componentDidMount)comp.componentDidMount()};
})();
