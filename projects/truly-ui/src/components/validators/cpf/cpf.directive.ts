/*
 MIT License

 Copyright (c) 2018 Temainfo Software

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:
 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.
 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */

import {
  AfterViewInit,
  ContentChild, Directive, forwardRef
} from '@angular/core';
import { FormControl, NG_VALIDATORS, Validator } from '@angular/forms';
import { CPFFactory } from './cpf.factory';
import { TlInput } from '../../input/input';

@Directive( {
    selector: '[cpf][ngModel],[cpf][formControl],[cpf][formControlName]',
    providers: [
      {
        multi: true,
        provide: NG_VALIDATORS,
        useExisting: forwardRef( () => CPFDirective),
      }
    ]
} )
export class CPFDirective implements Validator, AfterViewInit {

    @ContentChild(TlInput) tlinput;

    constructor() {}

    ngAfterViewInit() {}

    validate( c: FormControl ) {
      return CPFFactory.getInstance(  this.tlinput ).validate()( c );
    }
}
