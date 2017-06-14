import {
    Directive,
    HostListener,
    Input,
    AfterViewInit, OnInit, ContentChildren, QueryList, AfterContentInit, Renderer2
} from '@angular/core';
import { TlInput } from '../../input/input';


@Directive( {
    selector: '[mask]',
} )
export class FieldMaskDirective implements AfterViewInit, AfterContentInit {

    @ContentChildren( TlInput ) tlinput : QueryList<TlInput>;

    private maskGuides = true;
    private valueUppercase;
    private literalChar;
    private _value;
    private input;

    private startPosition : number;
    private endPosition : number;

    private shiftStart = '';

    private maskExpression : string;
    private maskGuideExpression : string;
    private maskSpecialCharacters : string[] = [ '/', '(', ')', '.', ':', '-', ' ', '+' ];
    private maskAwaliablePatterns : { [key : string] : RegExp } = {
        '0': /\d/,
        '9': /\d/,
        'A': /[a-zA-Z]/,
    };

    constructor( private renderer : Renderer2 ) {
    }

    @Input( 'mask' )
    public set _maskExpression( value : any ) {
        if ( !value ) {
            return;
        }
        if ( typeof value === 'string' ) {
            this.maskExpression = value;
            return;
        }
        if ( value[ 'guides' ] === false ) {
            this.maskGuides = value[ 'guides' ];
        }
        this.literalChar = value[ 'withLiteralChar' ];
        this.valueUppercase = value[ 'uppercase' ];
        this.maskExpression = value[ 'mask' ];
    }

    get value() {
        return this.input.nativeElement.value;
    }

    set value( value ) {
        this.input.nativeElement.value = value;
    }

    @HostListener( 'keypress', [ '$event' ] )
    public onKeyPress( $event ) : void {
        this.handleKeypress( $event );
        this.updateModel();
        this.onComplete();
    }

    @HostListener( 'mouseup', [ '$event' ] )
    public onMouseUp( $event ) : void {
        this.getPosition();
    }


    @HostListener( 'keydown', [ '$event' ] )
    onKeyDown( event ) : void {
        switch ( event.code ) {
            case 'Backspace':
                this.handleBackspace();
                break;
            case 'Delete':
                this.handleDelete( event );
                break;
            case 'ArrowRight':
                this.handleArrowRight( event );
                break;
            case 'ArrowLeft':
                this.handleArrowLeft( event );
                break;
        }
    }

    ngAfterContentInit() {
        this.input = this.tlinput.toArray()[ 0 ].input;
        this.inicializeOnFocus();
    }

    public ngAfterViewInit() {
        this.generateMaskGuideExpression();
        this.applyMaskOnInit();
        this.setPlaceholder();
        this.setValidation();
    }

    private applyMaskOnInit() {
        if ( this.value !== this.maskGuideExpression ) {
            setTimeout( () => {
                if ( this.value.length > 0 ) {
                    this.setValueOnInicialize();
                    this.applyGuides();
                    this.applyMask();
                }
            }, 0 );
        }
    }

    private getPosition() {
        this.startPosition = this.input.nativeElement.selectionStart;
        this.endPosition = this.input.nativeElement.selectionEnd;
    }

    private inicializeOnFocus() {
        this.renderer.listen( this.input.nativeElement, 'focus', () => {
            this.onFocus();
        } );
        this.renderer.listen( this.input.nativeElement, 'focusout', () => {
            this.onFocusOut();
        } );
    }

    private onFocus() {
        this.applyGuides();
        setTimeout( () => {
            if ( !this.isTextLengthMatchWithExpressionLength() ) {
                this.setPosition( 0 );
            } else {
                this.setPosition( 0, this.value.length );
            }
        }, 0 );
    }

    private onFocusOut() {
        if ( !this.isTextLengthMatchWithExpressionLength() ) {
            this.value = '';
            this.updateModel();
            this.onComplete();
        }
    }

    private handleBackspace() {
        const value = this.value;
        const start = this.input.nativeElement.selectionStart;
        const endPosition = this.input.nativeElement.selectionEnd;
        const valueArray = value.split( '' );

        if ( this.maskGuides ) {
            event.preventDefault();
            if ( this.isCharBeforeEqualMaskGuide( value, endPosition ) ) {
                this.jumpCharMask( start, endPosition );
            } else {
                this.deleteTextOnKeyPress( valueArray, start, endPosition );
            }
        }
        this.updateModel();
        this.onComplete();
    }

    private handleDelete( event ) {
        event.preventDefault();
        const cursor = this.input.nativeElement.selectionEnd;
        const valueArray = this.value.split( '' );
        const self = this;

        if ( this.hasTextSelected( this.startPosition, this.endPosition ) ) {
            this.deleteTextOnKeyPress( valueArray, this.startPosition, this.endPosition );
            return;
        }

        valueArray.forEach( function ( value, index, array ) {
            if ( index === cursor ) {
                array[ index ] = self.maskGuideExpression[ cursor ];
            }
        } );
        this.value = String( valueArray ).replace( /,/gi, '' );
        this.setPosition( cursor );
        this.updateModel();
        this.onComplete();
    }

    private handleKeypress( event ) {
        const charInputed = event.key;
        let inputArray = this.value.split( '' );

        if ( event.key === 'Enter' ) {
            return;
        }
        if ( this.hasTextSelected( this.startPosition, this.endPosition ) ) {
            this.deleteTextOnKeyPress( inputArray, this.startPosition, this.endPosition );
            this.setPosition( this.startPosition );
            inputArray = this.value.split( '' );
        }
        if ( this.maskGuides ) {
            this.getPosition();
            this.replaceValidChar( charInputed, this.getCursorPosition( this.endPosition ), inputArray );
        } else {
            this.applyMask( charInputed );
            event.preventDefault();
        }
    }

    private handleArrowRight( event ) {
        this.getPosition();
        if (event.shiftKey) {
            this.setShiftKey('Right');
            event.preventDefault();
            if (this.shiftStart === 'Left') {
                this.setPosition( this.startPosition + 1, this.endPosition );
            }else {
                this.setPosition( this.startPosition, this.endPosition + 1 );
            }
        }
    }

    private handleArrowLeft( event ) {
        this.getPosition();
        if ( event.shiftKey ) {
            this.setShiftKey('Left');
            event.preventDefault();
            if ( this.startPosition !== 0 ) {
                if ( this.shiftStart === 'Right' ) {
                    this.setPosition( this.startPosition, this.endPosition - 1 );
                } else {
                    this.setPosition( this.startPosition - 1, this.endPosition );
                }
            }
        }
    }


    private setShiftKey(value) {
        if (this.startPosition === this.endPosition) {
            this.shiftStart = '';
        }
        if (this.shiftStart === '') {
            this.shiftStart = value;
        }
    }

    private applyMask( charInputed? ) {
        let cursor = 0;
        let result = '';

        if ( charInputed !== undefined ) {
            this.value += charInputed;
        }

        const inputArray : string[] = this.value.split( '' );

        for ( let i = 0, inputSymbol = inputArray[ 0 ]; i < inputArray.length; i++ , inputSymbol = inputArray[ i ] ) {
            if ( result.length === this.maskExpression.length ) {
                break;
            }
            if ( this.isValidSymbolMask( inputSymbol, this.maskExpression[ cursor ] ) ) {
                result += inputSymbol;
                cursor++;
            } else if ( this.maskSpecialCharacters.indexOf( this.maskExpression[ cursor ] ) !== -1 ) {
                result += this.maskExpression[ cursor ];
                cursor++;
                i--;
            } else if ( this.maskExpression[ cursor ] === '9' ) {
                cursor++;
                i--;
            }
        }
        this.value = result;
        this.onComplete();
    }

    private deleteTextOnKeyPress( valueArray, startPosisition, endPosition ) {
        if ( this.hasTextSelected( startPosisition, endPosition ) ) {
            this.value = this.deleteTextSelected( valueArray, startPosisition, endPosition );
            this.setPosition( startPosisition, startPosisition );
        } else {
            this.value = this.deleteChar( valueArray, endPosition );
            this.setPosition( startPosisition - 1, endPosition - 1 );
        }
    }

    private deleteTextSelected( valueArray, startPosition, endPosition ) {
        const self = this;
        let valueResult = '';
        valueArray.forEach( function ( myValue, index ) {
            if ( index >= startPosition && index < endPosition ) {
                valueResult = valueResult + self.maskGuideExpression[ index ];
            } else {
                valueResult = valueResult + myValue;
            }
        } );
        return valueResult;
    }

    private deleteChar( valueArray, endPosition ) {
        const self = this;
        let valueResult = '';
        valueArray.forEach( function ( myValue, index ) {
            if ( index === endPosition - 1 ) {
                valueResult = valueResult + self.maskGuideExpression[ endPosition - 1 ];
            } else {
                valueResult = valueResult + myValue;
            }
        } );
        return valueResult;
    }

    private replaceUndescoreForChar( valueArray, charInputed, cursorEnd ) {
        if ( this.maskSpecialCharacters.indexOf( this.maskExpression[ cursorEnd ] ) >= 0 ) {
            cursorEnd++;
        }
        valueArray.forEach( function ( value, index, array ) {
            if ( index === cursorEnd ) {
                array[ index ] = charInputed;
            }
        } );
        return valueArray.toString().replace( /,/gi, '' );
    }

    private getCursorPosition( endPosition ) {
        let cursor = endPosition;
        while ( this.maskExpression.length - 1 > cursor ) {
            if ( this.maskSpecialCharacters.indexOf( this.maskExpression[ cursor ] ) >= 0 ) {
                cursor++;
                this.setPosition( cursor );
            } else {
                break;
            }
        }
        return cursor;
    }

    private replaceValidChar( charInputed, cursor, inputArray ) {
        if ( this.isValidSymbolMask( charInputed, this.maskExpression[ cursor ] ) ) {
            this.value = this.replaceUndescoreForChar( inputArray, charInputed, cursor );
            this.setPosition( cursor + 1 );
        }
    }

    private onComplete() {
        this.tlinput.toArray()[ 0 ].validations[ 'validMask' ] = this.isTextLengthMatchWithExpressionLength();
    }

    private isTextLengthMatchWithExpressionLength() {
        return ( this.clearMask( this.maskExpression ).length === this.clearMask( this.value ).length)
            && ( ( this.cleanValue( this.maskExpression ).length === this.cleanValue( this.value ).length))
            && ( ( this.removeUndescore( this.maskExpression ).length === this.removeUndescore( this.value ).length));
    }

    private isValidSymbolMask( inputSymbol : string, maskSymbolChar : string ) : boolean {
        return ( inputSymbol === maskSymbolChar || this.maskAwaliablePatterns[ maskSymbolChar ] )
            && (this.maskAwaliablePatterns[ maskSymbolChar ].test( inputSymbol ));
    }

    private updateModel() : void {
        const endPosition = this.input.nativeElement.selectionEnd;
        if ( this.valueUppercase ) {
            this.value = this.value.toUpperCase();
        }
        this.tlinput.toArray()[ 0 ].onChangeCallback( this.clearMask( this.value ) );
        this.setPosition( endPosition );
    }


    private setValidation() {
        this.input.nativeElement.maxLength = this.maskExpression.length;
        this.input.nativeElement.minLength = this.maskExpression.length;
    }

    private applyGuides() {
        const self = this;
        if ( this.maskGuides ) {
            setTimeout( function () {
                if ( self.input.nativeElement.value.length === 0 ) {
                    self.input.nativeElement.value = self.maskGuideExpression;
                }
            }, 1 );
        }
    }

    private generateMaskGuideExpression() : string {
        let mask = this.maskExpression;
        mask = mask.replace( /9/gi, '_' );
        mask = mask.replace( /0/gi, '_' );
        mask = mask.replace( /A/gi, '_' );
        return this.maskGuideExpression = mask;
    }

    private clearMask( value : string ) : string {
        if ( !(this.literalChar) ) {
            return this.cleanValue( value );
        }
        return this.removeUndescore( value );
    }

    private jumpCharMask( startPosition, endPosition ) {
        if ( this.isFirstPosition( startPosition ) ) {
            this.setPosition( startPosition - 1, endPosition - 1 );
        }
    }

    private setPosition( startPosition, endPosition? ) {
        if ( endPosition === undefined ) {
            endPosition = startPosition;
        }
        this.input.nativeElement.setSelectionRange( startPosition, endPosition );
        this.getPosition();
    }

    private isCharBeforeEqualMaskGuide( value, position ) {
        return value[ position - 1 ] === this.maskGuideExpression[ position - 1 ];
    }

    private isFirstPosition( startPosition ) {
        return startPosition > 0;
    }

    private hasTextSelected( startPosition, endPosition ) {
        return startPosition !== endPosition;
    }

    private removeUndescore( value ) {
        return value.replace( /_/gi, '' );
    }

    private setPlaceholder() {
        this.input.nativeElement.placeholder = this.maskExpression;
    }

    private setValueOnInicialize() {
        this._value = this.value;
    }

    private cleanValue( value ) {
        return value.replace( /(\/|\.|-|_|\(|\)|:|\+)/gi, '' );
    }
}