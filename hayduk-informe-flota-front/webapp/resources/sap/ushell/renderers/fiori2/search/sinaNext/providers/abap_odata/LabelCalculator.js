sinaDefine(['../../core/core'],function(c){var a=0;var N=c.defineClass({_init:function(p,n){this.parent=p;this.nodeId=n;this.childMap={};this.children=[];},insert:function(k,d){if(k.length===0){this.data={dataSource:d,label:d.label,labelPlural:d.labelPlural};var l=this.calculateLabel();return;}var b=k[0];var s=this.childMap[b];if(k.length===1&&s){throw new c.Exception('duplicate tree node');}if(!s){s=new N(this,b);this.childMap[b]=s;this.children.push(s);if(this.children.length===2){this.children[0].recalculateLabels();}}s.insert(k.slice(1),d);},recalculateLabels:function(){var l=[];this.collectLeafs(l);for(var i=0;i<l.length;++i){l[i].calculateLabel();}},collectLeafs:function(l){if(this.isLeaf()){l.push(this);return;}for(var i=0;i<this.children.length;++i){this.children[i].collectLeafs(l);}},isLeaf:function(){return this.children.length===0;},hasSibling:function(){return this.parent&&this.parent.children.length>=2;},isChildOfRoot:function(){return this.parent&&this.parent.nodeId==='__ROOT';},collectPath:function(k,f){if(!this.parent){return;}if(f||this.hasSibling()||this.isChildOfRoot()){k.push(this.nodeId);f=true;}if(this.parent){this.parent.collectPath(k,f);}},calculateLabel:function(){var k=[];this.collectPath(k);k.reverse();k.splice(0,1,this.data.label);this.data.dataSource.label=k.join(' ');k.splice(0,1,this.data.labelPlural);this.data.dataSource.labelPlural=k.join(' ');}});return c.defineClass({_init:function(){this.rootNode=new N(null,'__ROOT');},calculateLabel:function(d){var s={system:d.system,client:d.client};try{this.rootNode.insert([d.labelPlural,s.system,s.client],d);}catch(e){if(e instanceof c.Exception&&e.toString()==='duplicate tree node'){var a=c.generateId();d.label=d.label+a;d.labelPlural=d.labelPlural+a;return;}throw e;}}});});
