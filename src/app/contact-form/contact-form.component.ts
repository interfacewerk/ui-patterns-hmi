import { AfterViewInit, Component, Directive, EventEmitter, HostBinding, HostListener, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { EditableContactData } from '../contacts.service';


@Component({
  selector: 'app-contact-form',
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.scss']
})
export class ContactFormComponent implements OnInit, AfterViewInit, OnDestroy {
  private valueChanges: Subscription;
  showNumpad = false;
  watchContactChanges: Subscription;
  showGraph: boolean;
  @Input() model: EditableContactData;
  @HostBinding('class.disabled') @Input() formDisabled: boolean;

  @Output() onChange = new EventEmitter<void>();
  @Output() onValid = new EventEmitter<boolean>();
  @Output() onSubmit = new EventEmitter<EditableContactData>();
  @ViewChild(NgForm) contactForm: NgForm;


  updateDataFromNumpad($event) {
    this.model.phone = $event;
    this.showNumpad = false;
  }

  @HostListener('document:keydown', ['$event'])
  displayModal($event: KeyboardEvent) {
    if ($event.key === 'n' && $event.ctrlKey) {
      this.showNumpad = true;
    }
  }

  ngAfterViewInit() {
    this.valueChanges = this.contactForm.valueChanges.subscribe(() => {
      this.onValid.emit(this.contactForm.valid);
      this.checkForGraph();
    });

    function Graph(config) {
      // user defined properties
      this.canvas = document.getElementById(config.canvasId);
      this.minX = config.minX;
      this.minY = config.minY;
      this.maxX = config.maxX;
      this.maxY = config.maxY;
      this.unitsPerTick = config.unitsPerTick;

      // constants
      this.axisColor = '#aaa';
      this.font = '8pt Helvetica';
      this.tickSize = 20;

      // relationships
      this.context = this.canvas.getContext('2d');
      this.rangeX = this.maxX - this.minX;
      this.rangeY = this.maxY - this.minY;
      this.unitX = this.canvas.width / this.rangeX;
      this.unitY = this.canvas.height / this.rangeY;
      this.centerY = Math.round(Math.abs(this.minY / this.rangeY) * this.canvas.height);
      this.centerX = Math.round(Math.abs(this.minX / this.rangeX) * this.canvas.width);
      this.iteration = (this.maxX - this.minX) / 1000;
      this.scaleX = this.canvas.width / this.rangeX;
      this.scaleY = this.canvas.height / this.rangeY;

      // draw x and y axis
      this.drawXAxis();
      this.drawYAxis();
    }

    Graph.prototype.drawXAxis = function () {
      const context = this.context;
      context.save();
      context.beginPath();
      context.moveTo(0, this.centerY);
      context.lineTo(this.canvas.width, this.centerY);
      context.strokeStyle = this.axisColor;
      context.lineWidth = 2;
      context.stroke();

      // draw tick marks
      const xPosIncrement = this.unitsPerTick * this.unitX;
      let xPos, unit;
      context.font = this.font;
      context.textAlign = 'center';
      context.textBaseline = 'top';

      // draw left tick marks
      xPos = this.centerX - xPosIncrement;
      unit = -1 * this.unitsPerTick;
      while (xPos > 0) {
        context.moveTo(xPos, this.centerY - this.tickSize / 2);
        context.lineTo(xPos, this.centerY + this.tickSize / 2);
        context.stroke();
        context.fillText(unit, xPos, this.centerY + this.tickSize / 2 + 3);
        unit -= this.unitsPerTick;
        xPos = Math.round(xPos - xPosIncrement);
      }

      // draw right tick marks
      xPos = this.centerX + xPosIncrement;
      unit = this.unitsPerTick;
      while (xPos < this.canvas.width) {
        context.moveTo(xPos, this.centerY - this.tickSize / 2);
        context.lineTo(xPos, this.centerY + this.tickSize / 2);
        context.stroke();
        context.fillText(unit, xPos, this.centerY + this.tickSize / 2 + 3);
        unit += this.unitsPerTick;
        xPos = Math.round(xPos + xPosIncrement);
      }
      context.restore();
    };

    Graph.prototype.drawYAxis = function () {
      const context = this.context;
      context.save();
      context.beginPath();
      context.moveTo(this.centerX, 0);
      context.lineTo(this.centerX, this.canvas.height);
      context.strokeStyle = this.axisColor;
      context.lineWidth = 2;
      context.stroke();

      // draw tick marks
      const yPosIncrement = this.unitsPerTick * this.unitY;
      let yPos, unit;
      context.font = this.font;
      context.textAlign = 'right';
      context.textBaseline = 'middle';

      // draw top tick marks
      yPos = this.centerY - yPosIncrement;
      unit = this.unitsPerTick;
      while (yPos > 0) {
        context.moveTo(this.centerX - this.tickSize / 2, yPos);
        context.lineTo(this.centerX + this.tickSize / 2, yPos);
        context.stroke();
        context.fillText(unit, this.centerX - this.tickSize / 2 - 3, yPos);
        unit += this.unitsPerTick;
        yPos = Math.round(yPos - yPosIncrement);
      }

      // draw bottom tick marks
      yPos = this.centerY + yPosIncrement;
      unit = -1 * this.unitsPerTick;
      while (yPos < this.canvas.height) {
        context.moveTo(this.centerX - this.tickSize / 2, yPos);
        context.lineTo(this.centerX + this.tickSize / 2, yPos);
        context.stroke();
        context.fillText(unit, this.centerX - this.tickSize / 2 - 3, yPos);
        unit -= this.unitsPerTick;
        yPos = Math.round(yPos + yPosIncrement);
      }
      context.restore();
    };

    Graph.prototype.drawEquation = function (equation, color, thickness) {
      const context = this.context;
      context.save();
      context.save();
      this.transformContext();

      context.beginPath();
      context.moveTo(this.minX, equation(this.minX));

      for (let x = this.minX + this.iteration; x <= this.maxX; x += this.iteration) {
        context.lineTo(x, equation(x));
      }

      context.restore();
      context.lineJoin = 'round';
      context.lineWidth = thickness;
      context.strokeStyle = color;
      context.stroke();
      context.restore();
    };

    Graph.prototype.transformContext = function () {
      const context = this.context;

      // move context to center of canvas
      this.context.translate(this.centerX, this.centerY);

      /*
       * stretch grid to fit the canvas window, and
       * invert the y scale so that that increments
       * as you move upwards
       */
      context.scale(this.scaleX, -this.scaleY);
    };
    const myGraph = new Graph({
      canvasId: 'myCanvas',
      minX: -2,
      minY: -2,
      maxX: 2,
      maxY: 2,
      unitsPerTick: 1
    });

    myGraph.drawEquation(function (x) {
      return 1 * Math.sqrt(1 - x * x);
    }, 'blue', 1);
    myGraph.drawEquation(function (x) {
      return -1 * Math.sqrt(1 - x * x);
    }, 'blue', 1);

    this.checkForGraph();
  }

  ngOnDestroy() {
    this.valueChanges.unsubscribe();
  }

  ngOnInit() {
    this.checkForGraph();
  }

  $onChange() {
    this.onChange.emit();
    this.checkForGraph();
  }

  checkForGraph() {
    if (this.model.email.indexOf('G17 G20 G90 G94 G54') != -1) {
      this.showGraph = true;
    } else {
      this.showGraph = false;
    }
  }

  $onSubmit() {
    this.onSubmit.emit(this.model);
  }
}

@Directive({
  selector: 'app-contact-form-header'
})
export class ContactFormHeaderDirective { }

@Directive({
  selector: 'app-contact-form-footer'
})
export class ContactFormFooterDirective { }
