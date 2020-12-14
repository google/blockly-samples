import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BlocklyComponent } from './blockly.component';

describe('BlocklyComponent', () => {
  let component: BlocklyComponent;
  let fixture: ComponentFixture<BlocklyComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BlocklyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlocklyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
