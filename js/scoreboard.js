function ScoreBoardCell( outerID ) {

    this._outerID = outerID;
    this.getCurrentLetter  = function () {
        if ($(this._outerID).hasClass('flip')) {
            return $(this._outerID + ' .back').text().trim();
        } else {
            return $(this._outerID + ' .front').text().trim();
        }
    }

    this.callSelfNext = function () {
        this.setNextLetter(this._nextLetter, this._stopAt, this._direction);
    }

    this._nextLetter = null;
    this._stopAt = null;
    this._direction = null;

    this.setNextLetter = function (letter, stopAt, direction) {
        var setTo = letter;
        if (letter == '&' || letter == '@') {
            setTo = '+';
        }
        var that = this;
        var nextLetter;
        if ($(this._outerID).hasClass('flip')) {
            $(this._outerID + ' .front').text(setTo.trim());
        } else {
            $(this._outerID + ' .back').text(setTo.trim());
        }
        $( this._outerID ).toggleClass('flip');
        if (letter !== stopAt) {
            nextLetter = letter.charCodeAt(0) + (direction);
            nextLetter = String.fromCharCode(nextLetter);
            var distance = Math.abs(nextLetter.charCodeAt(0) - stopAt.charCodeAt(0));
            var timeOut = 25;

            if (distance > 10) {
                timeOut = 5;
            }
            else if (distance > 6) {
                timeOut = 7;
            }
            else if (distance > 2) {
                timeOut = 10;
            }


            timeOut += Math.random() * 100;


            this._nextLetter = nextLetter;
            this._direction = direction;
            this._stopAt = stopAt;
            $(this._outerID + ' .persist-behind').text(setTo);

            var callSelfNext = function () { that.callSelfNext(); }


            setTimeout(callSelfNext, timeOut);
        }
    }


    this.flipTo = function (letter) {


        var direction = 1;

        var currentLetter = this.getCurrentLetter();

        if (currentLetter.charCodeAt(0) > letter.charCodeAt(0)) {
            direction = -1;
        }


        this.setNextLetter(currentLetter, letter, direction);

    }
}



function ScoreBoard(startingDivID, totalLetters, firstMessage ) {

    this._startingDivID = startingDivID;
    this._cells = new Array();

    this.padMessage = function (message) {
        if (message.length < totalLetters) {
            var len = message.length;
            for (var i = 0; i < totalLetters - len; ++i) {
                message += "+";
            }

        }
        return message;
    };

    firstMessage = firstMessage.toUpperCase();
    firstMessage = this.padMessage(firstMessage);

    this.addACell = function (cellNumber) {
        var cellId = this._startingDivID + '-cell-' + cellNumber;
        $('#' + this._startingDivID).append('<div id="' + cellId + '" class="flip-container vertical"></div>');
        $('#' + cellId).append('<div class="flip-frame"><div class="persist-behind">+</div><div class="flipper" ><div class="front" >+</div><div class="back">+</div></div></div>');
        this._cells[cellNumber] = new ScoreBoardCell('#' + cellId);
    };

    for (var i = 0; i < totalLetters; ++i) {
        this.addACell(i);
    }
    for (i = 0; i < totalLetters && i < firstMessage.length; ++i) {
        this._cells[i].flipTo(firstMessage.charAt(i));
    }
    this.changeMessageTo = function (newMessage) {
        newMessage = newMessage.toUpperCase();
        newMessage = this.padMessage(newMessage);
        for (i = 0; i < totalLetters && i < newMessage.length; ++i) {
            this._cells[i].flipTo(newMessage.charAt(i));
        }
    };

    this.messageAt = function (newMessage, startAt ) {
        var end =  Math.min( newMessage.length, (totalLetters - startAt));
        for (i = 0; i < end; ++i ) {
            this._cells[startAt + i].flipTo(newMessage.charAt(i));
        }
    };

    this._secondsCell = totalLetters - 1;
    this._10sCell = totalLetters - 2;
    this._minCell = totalLetters - 4; // Allow for the :
    this._10minCell = totalLetters - 5;  // No hours (for now)
    this._endMessage = null;
    this._countDownDelay = true;
    this.countDown = function (startMessage, startTime, endMessage, delay ) {
        // Need to add assertion that startTime in 00:00 format
        this.changeMessageTo(startMessage);
        this._endMessage = endMessage;
        this.messageAt(startTime, this._10minCell);
        if ( delay !== false) {
            this._countDownDelay = true;
        } else {
            this._countDownDelay = false;
        }
        var that = this;

        var tickTimer = function () {
            that.tickDown();
        }

        if ( ! this._countDownDelay ) {
            setTimeout(tickTimer, 1000);
        }
    }

    this.tickDown = function() {
        var sec = parseInt(this._cells[this._secondsCell].getCurrentLetter());
        var sec10 =  parseInt(this._cells[this._10sCell].getCurrentLetter());
        var min = parseInt(this._cells[this._minCell].getCurrentLetter());
        var min10 = parseInt(this._cells[this._10minCell].getCurrentLetter());
        var dec10s = false;
        var decMin = false;
        var dec10Min = false;
        if (sec == 0 && sec10 == 0 && min == 0 && min10 == 0) {
            this.changeMessageTo(this._endMessage);
        }
        else {
            if ( ! this._countDownDelay ) {
                if ( sec == 0 ) {
                    sec = 9;
                    dec10s = true;
                }
                else {
                    --sec;
                }
                this.messageAt(sec.toString(),this._secondsCell);
                if ( dec10s ) {
                    if (sec10 == 0) {
                        sec10 = 5;
                        decMin = true;
                    } else {
                        --sec10;
                    }
                    this.messageAt(sec10.toString(), this._10sCell);
                }
                if ( decMin ) {
                    if (min == 0) {
                        if ( min10 > 0) {
                            min = 5;
                            dec10Min = true;
                        }
                    } else {
                        --min;
                    }
                    this.messageAt(min.toString(), this._minCell );
                }
                if (dec10s) {
                    if (min10 > 0) {
                        --min10;
                        this.messageAt(min10.toString(), this._10minCell );
                    }
                }

                var that = this;
                var tickTimer = function () {
                    that.tickDown();
                }

                if ( ! this._countDownDelay ) {
                    setTimeout(tickTimer, 1000);
                }
            }

        }

    };

    this.toggleCountDown = function() {
        this._countDownDelay = ! this._countDownDelay;
        if (! this._countDownDelay ) {
            this.tickDown();
        }
    }

}
