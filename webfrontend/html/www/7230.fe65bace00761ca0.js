"use strict";(self.webpackChunkapp=self.webpackChunkapp||[]).push([[7230],{7230:(k,g,i)=>{i.r(g),i.d(g,{MqttConfigPageModule:()=>C});var p=i(6814),a=i(6223),r=i(7027),d=i(9515),u=i(6089),c=i(5861),f=i(4345),t=i(5879),h=i(9140);function q(n,l){1&n&&t._UZ(0,"ion-back-button",13)}function b(n,l){1&n&&t._UZ(0,"ion-menu-button")}const T=[{path:"",component:(()=>{var n;class l{constructor(e,o,s,M,P,Z,_,S,w){this.translate=e,this.fb=o,this.alertController=s,this.router=M,this.loadingController=P,this.storageService=Z,this.route=_,this.navCtrl=S,this.ionRouterOutlet=w,this.mqttSettingsForm=f.KB,this.hidePassword="password",this.eye="eye",this.mqttForm=this.fb.group({mqtt_hostname:["",a.kI.required],mqtt_port:["",a.kI.required],mqtt_username:["",a.kI.required],mqtt_password:["",a.kI.required],mqtt_topic:["",a.kI.required]}),this.MQTTAddressLabel="MQTT server IP "+this.translate.instant("Address").toLowerCase(),this.MQTTWebsocketLabel="MQTT server secure websocket "+this.translate.instant("Port").toLowerCase(),this.MQTTUsernameLabel="MQTT server "+this.translate.instant("Username").toLowerCase(),this.MQTTPasswordLabel="MQTT server "+this.translate.instant("Password").toLowerCase()}ngOnInit(){this.canGoBack=this.ionRouterOutlet.canGoBack(),this.currentUrl=this.router.url,this.routerEventsSubscription=this.router.events.subscribe(e=>{e instanceof u.m2&&(this.previousUrl=this.currentUrl,this.currentUrl=e.url)}),this.storageSubscription=this.storageService.settings$.subscribe(e=>{e&&e.mqtt&&this.updateForm(e.mqtt)})}updateForm(e){var o=this;return(0,c.Z)(function*(){e&&(e.hostname&&(o.mqttSettingsForm.hostname=e.hostname),e.port&&(o.mqttSettingsForm.port=e.port),e.username&&(o.mqttSettingsForm.username=e.username),e.password&&(o.mqttSettingsForm.password=e.password),e.topic&&(o.mqttSettingsForm.topic=e.topic),o.mqttForm&&o.mqttForm.setValue({mqtt_hostname:o.mqttSettingsForm.hostname,mqtt_port:o.mqttSettingsForm.port,mqtt_username:o.mqttSettingsForm.username,mqtt_password:o.mqttSettingsForm.password,mqtt_topic:o.mqttSettingsForm.topic}))})()}saveSettings(){var e=this;return(0,c.Z)(function*(){const o=yield e.loadingController.create({cssClass:"spinner",spinner:"crescent",message:"Please wait..."});yield o.present();let s=yield e.processFields(e.mqttForm);yield e.storageService.saveSettings({mqtt:{hostname:s.hostname,port:s.port,username:s.username,password:s.password,topic:s.topic}}),yield o.dismiss(),e.navCtrl.navigateRoot("")})()}cancel(){this.navCtrl.navigateRoot("")}reset(){var e=this;return(0,c.Z)(function*(){yield e.updateForm({hostname:"",port:null,username:"",password:"",topic:""}),e.storageService.cleanStorage()})()}processFields(e){return(0,c.Z)(function*(){let o=e.value.mqtt_hostname,s=e.value.mqtt_port;return o.includes("http://")&&(o=o.replace("http://","")),o.match(":[0-9]{4,6}")&&(s=Number(o.split(":")[1]),o=o.split(":")[0]),{hostname:o,port:s,username:e.value.mqtt_username,password:e.value.mqtt_password,topic:e.value.mqtt_topic}})()}ngOnDestroy(){this.routerEventsSubscription.unsubscribe(),this.storageSubscription.unsubscribe()}toggleHidePassword(){this.hidePassword="text"===this.hidePassword?"password":"text",this.eye="eye"===this.eye?"eye-off":"eye"}}return(n=l).\u0275fac=function(e){return new(e||n)(t.Y36(d.sK),t.Y36(a.qu),t.Y36(r.Br),t.Y36(u.F0),t.Y36(r.HT),t.Y36(h.V1),t.Y36(u.gz),t.Y36(r.SH),t.Y36(r.jP))},n.\u0275cmp=t.Xpm({type:n,selectors:[["app-mqtt-config"]],decls:32,vars:24,consts:[["slot","start"],["defaultHref","previousUrl",4,"ngIf"],[4,"ngIf"],[3,"formGroup","ngSubmit"],[1,"input-group"],["labelPlacement","stacked","placeholder","IP Address","formControlName","mqtt_hostname",3,"label"],["labelPlacement","stacked","placeholder","Port","formControlName","mqtt_port",3,"label"],["labelPlacement","stacked","placeholder","Username","formControlName","mqtt_username",3,"label"],["labelPlacement","stacked","placeholder","Password","formControlName","mqtt_password",3,"label","type"],["item-right","",3,"name","click"],["label","MQTT topic","labelPlacement","stacked","placeholder","MQTT Topic","formControlName","mqtt_topic"],["type","submit","expand","block",3,"disabled"],["expand","block",1,"btn_light",3,"click"],["defaultHref","previousUrl"]],template:function(e,o){1&e&&(t.TgZ(0,"ion-header")(1,"ion-toolbar")(2,"ion-buttons",0),t.YNc(3,q,1,0,"ion-back-button",1),t.YNc(4,b,1,0,"ion-menu-button",2),t.qZA(),t.TgZ(5,"ion-title"),t._uU(6),t.ALo(7,"lowercase"),t.ALo(8,"translate"),t.qZA()()(),t.TgZ(9,"ion-content")(10,"form",3),t.NdJ("ngSubmit",function(){return o.saveSettings()}),t.TgZ(11,"div",4)(12,"ion-item"),t._UZ(13,"ion-input",5),t.qZA(),t.TgZ(14,"ion-item"),t._UZ(15,"ion-input",6),t.qZA(),t.TgZ(16,"ion-item"),t._UZ(17,"ion-input",7),t.qZA(),t.TgZ(18,"ion-item"),t._UZ(19,"ion-input",8),t.TgZ(20,"ion-icon",9),t.NdJ("click",function(){return o.toggleHidePassword()}),t.qZA()(),t.TgZ(21,"ion-item"),t._UZ(22,"ion-input",10),t.qZA()(),t.TgZ(23,"ion-button",11),t._uU(24),t.ALo(25,"translate"),t.qZA()(),t.TgZ(26,"ion-button",12),t.NdJ("click",function(){return o.cancel()}),t._uU(27),t.ALo(28,"translate"),t.qZA(),t.TgZ(29,"ion-button",12),t.NdJ("click",function(){return o.reset()}),t._uU(30),t.ALo(31,"translate"),t.qZA()()),2&e&&(t.xp6(3),t.Q6J("ngIf",o.canGoBack),t.xp6(1),t.Q6J("ngIf",!o.canGoBack),t.xp6(2),t.hij("MQTT ",t.lcZ(7,14,t.lcZ(8,16,"Configuration")),""),t.xp6(4),t.Q6J("formGroup",o.mqttForm),t.xp6(3),t.s9C("label",o.MQTTAddressLabel),t.xp6(2),t.s9C("label",o.MQTTWebsocketLabel),t.xp6(2),t.s9C("label",o.MQTTUsernameLabel),t.xp6(2),t.s9C("label",o.MQTTPasswordLabel),t.Q6J("type",o.hidePassword),t.xp6(1),t.Q6J("name",o.eye),t.xp6(3),t.Q6J("disabled",!o.mqttForm.valid),t.xp6(1),t.Oqu(t.lcZ(25,18,"Save settings")),t.xp6(3),t.Oqu(t.lcZ(28,20,"Cancel")),t.xp6(3),t.Oqu(t.lcZ(31,22,"Reset")))},dependencies:[p.O5,a._Y,a.JJ,a.JL,r.oU,r.YG,r.Sm,r.W2,r.Gu,r.gu,r.pK,r.Ie,r.fG,r.wd,r.sr,r.j9,r.cs,a.sg,a.u,p.i8,d.X$],styles:[".btn_light[_ngcontent-%COMP%]{--background: var(--ion-card-background, #ffffff);color:var(--ion-text-color, #666666)}ion-input[_ngcontent-%COMP%]   .label-text[_ngcontent-%COMP%]   .sc-ion-input-md[_ngcontent-%COMP%]{color:red!important}"]}),l})()}];let v=(()=>{var n;class l{}return(n=l).\u0275fac=function(e){return new(e||n)},n.\u0275mod=t.oAB({type:n}),n.\u0275inj=t.cJS({imports:[u.Bz.forChild(T),u.Bz]}),l})(),C=(()=>{var n;class l{}return(n=l).\u0275fac=function(e){return new(e||n)},n.\u0275mod=t.oAB({type:n}),n.\u0275inj=t.cJS({imports:[p.ez,a.u5,r.Pc,v,a.UX,d.aw]}),l})()}}]);