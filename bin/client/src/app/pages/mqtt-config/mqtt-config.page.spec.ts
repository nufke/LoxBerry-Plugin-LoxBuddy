import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { MqttConfigPage } from './mqtt-config.page';

describe('LoginPage', () => {
  let component: MqttConfigPage;
  let fixture: ComponentFixture<MqttConfigPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MqttConfigPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MqttConfigPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
