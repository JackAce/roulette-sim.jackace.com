let currentSelectedChip = 5;
//let wagers = [];
let wagers = {};
let rouletteSystem = {
};

function addHotSpot(identifier, isGreen, left, top, className) {
    let newDiv = document.createElement('div');

    newDiv.id = identifier;
    newDiv.classList.add('hotspot');
    newDiv.classList.add(className);

    newDiv.classList.add(isGreen ? 'hotspot-g' : 'hotspot-r');
    newDiv.style.left = left + 'px';
    newDiv.style.top = top + 'px';
    newDiv.onmouseover = function() { onSpotHover(newDiv) };
    newDiv.onmouseout = function() { onSpotHoverEnd(newDiv) };
    newDiv.onclick = function() { onSpotClick(newDiv) };

    $('#mainDiv').append(newDiv);
}

function isGreen(spot) {
    return ROULETTE_NUMBERS_GREEN.includes(spot);
}

function isRed(spot) {
    return ROULETTE_NUMBERS_RED.includes(spot);
}

function isBlack(spot) {
    return ROULETTE_NUMBERS_BLACK.includes(spot);
}

function onSpotHover(element) {
    //console.log('Hover over [' + element.id + ']');
}

function onSpotHoverEnd(element) {
    //console.log('Hover OUT [' + element.id + ']');
}

function setCurrentChip(chipAmount) {
    currentSelectedChip = chipAmount;
    // TODO: make the other chip images look disabled
    //console.log('Current Chip set to ' + chipAmount);
}

function onSpotClick(element) {
    if (wagers[element.id]) {
        wagers[element.id] += currentSelectedChip;
        $('#chip-' + element.id + ' div').text(wagers[element.id]);
    }
    else {

        let newDiv = document.createElement('div');
        let newImg = document.createElement('img');
        let newTextDiv = document.createElement('div');

        newDiv.id = 'chip-' + element.id;
        newDiv.classList.add('chip');
        newDiv.classList.add('chip-bet');

        // console.log('w: ' + $('#' + element.id).width());
        // console.log('h: ' + $('#' + element.id).height());
        let divWidth = $('#' + element.id).width();
        let divHeight = $('#' + element.id).height();
        let divLeft = $('#' + element.id).position().left;
        let divTop = $('#' + element.id).position().top;

        newDiv.style.left = divLeft + (divWidth / 2) - (CHIP_WIDTH / 2);
        newDiv.style.top = divTop + (divHeight / 2) - (CHIP_HEIGHT / 2);

        newImg.id = 'chip-img-' + element.id;
        newImg.width = CHIP_WIDTH;
        newImg.height = CHIP_HEIGHT;

        newTextDiv.classList.add('chip-text');
        newTextDiv.innerHTML = currentSelectedChip;

        $('#mainDiv').append(newDiv);
        $('#' + newDiv.id ).append(newImg);
        $('#' + newDiv.id ).append(newTextDiv);

        wagers[element.id] = currentSelectedChip;
    }

    setChipImage(element.id);

    updateConfiguration();

    //let betInfo = getBetInfo(element.id)
    //console.log(betInfo);
}

function setChipImage(spotId) {
    let wagerAmount = wagers[spotId];
    let src = IMG_SRC_CHIP_1000_BLANK;
    if (wagerAmount < 5) {
        src = IMG_SRC_CHIP_1_BLANK;
    }
    else if (wagerAmount < 25) {
        src = IMG_SRC_CHIP_5_BLANK;
    }
    else if (wagerAmount < 100) {
        src = IMG_SRC_CHIP_25_BLANK;
    }
    else if (wagerAmount < 500) {
        src = IMG_SRC_CHIP_100_BLANK;
    }
    else if (wagerAmount < 1000) {
        src = IMG_SRC_CHIP_500_BLANK;
    }
    $('#chip-img-' + spotId ).attr('src', src);

}

function updateConfiguration() {
    //console.log('update config');
    $('#wager-config-textarea').val(JSON.stringify(wagers));

}

function getBetInfo(identifier) {
    let identifierParts = identifier.split('-');
    if (identifierParts.length < 2 || identifierParts > 3) {
        console.error('COULD NOT PARSE identifier: [' + identifier + ']');
        return null;
    }

    let betType = identifierParts[0];
    let payout = getPayout(betType);
    let numberCount = parseInt(identifierParts[0].substring(1));
    let identifierPart2 = identifierParts.length === 3 ? identifierParts[2] : null;
    let numbersCovered = getNumbersCovered(betType, identifierParts[1], identifierPart2);
    let canonicalName = getCanonicalName(betType, identifierParts[1], identifierPart2);

    return {
        identifier: identifier,
        betType: betType,
        payout: payout,
        numberCount: numberCount,
        numbersCovered: numbersCovered,
        canonicalName: canonicalName
    }
}

function getPayout(betType) {
    switch (betType) {
        case 'x1':
            return 35;
        case 'x2':
            return 17;
        case 'x3':
            return 11;
        case 'x4':
            return 8;
        case 'x5':
            return 6; // Top Line Bet
        case 'x6':
            return 5;
        case 'x12':
            return 2;
        case 'x18':
            return 1;
    }

    return null;
}

function getNumbersCovered(betType, identifierPart1, identifierPart2) {
    // All Straight Up Bets
    if (betType === 'x1') {
        return [identifierPart1];
    }
    if (betType === 'x2') {
        return [identifierPart1, identifierPart2];
    }
    // Top Line Bet
    if (betType === 'x5') {
        return ['0', '00', '1', '2', '3'];
    }

    let identifierPart1Value = parseInt(identifierPart1);
    let identifierPart2Value = parseInt(identifierPart2);
    let returnValue = [identifierPart1];

    // Don't add 1 to identifierPart1 because of 'x3-0-3'
    // You have to subtract 1 from identifierPart2
    if (betType === 'x3' ) {
        return [identifierPart1, (identifierPart2Value - 1).toString(), identifierPart2];
    }

    if (betType === 'x4' ) {
        return [identifierPart1, (identifierPart1Value + 1).toString(), (identifierPart2Value - 1).toString(), identifierPart2];
    }

    if (betType === 'x6' ) {
        return [
            identifierPart1,
            (identifierPart1Value + 1).toString(),
            (identifierPart1Value + 2).toString(),
            (identifierPart1Value + 3).toString(),
            (identifierPart1Value + 4).toString(),
            identifierPart2];
    }

    if (betType === 'x12') {
        if (identifierPart1 === 'doz3') {
            return ROULETTE_NUMBERS_DOZ3;
        }
        if (identifierPart1 === 'doz2') {
            return ROULETTE_NUMBERS_DOZ2;
        }
        if (identifierPart1 === 'doz1') {
            return ROULETTE_NUMBERS_DOZ1;
        }
        if (identifierPart1 === 'col3') {
            return ROULETTE_NUMBERS_COL3;
        }
        if (identifierPart1 === 'doz2') {
            return ROULETTE_NUMBERS_COL2;
        }
        return ROULETTE_NUMBERS_COL1;
    }

    if (betType === 'x18') {
        if (identifierPart1 === 'high') {
            return ROULETTE_NUMBERS_HIGH;
        }
        if (identifierPart1 === 'low') {
            return ROULETTE_NUMBERS_LOW;
        }
        if (identifierPart1 === 'red') {
            return ROULETTE_NUMBERS_RED;
        }
        if (identifierPart1 === 'black') {
            return ROULETTE_NUMBERS_BLACK;
        }
        if (identifierPart1 === 'odd') {
            return ROULETTE_NUMBERS_ODD;
        }
        return ROULETTE_NUMBERS_EVEN;
    }

    return returnValue;
}

function getCanonicalName(betType, identifierPart1, identifierPart2) {
    if (betType === 'x3' && identifierPart1 === '0' && identifierPart2 === '2') {
        return '0-1-2 3 Number Bet';        
    }
    if (betType === 'x3' && identifierPart1 === '0' && identifierPart2 === '3') {
        return '0-2-3 3 Number Bet';        
    }

    switch (betType) {
        case 'x1':
            return identifierPart1 + ' Straight-up';
        case 'x2':
            return identifierPart1 + '-' + identifierPart2 + ' Split';
        case 'x3':
            return identifierPart1 + '-' + identifierPart2 + ' Street';
        case 'x4':
            return identifierPart1 + '-' + identifierPart2 + ' Corner';
        case 'x5':
            return 'Top Line';
        case 'x6':
            return identifierPart1 + '-' + identifierPart2 + ' Double Street';
    }

    if (betType === 'x12') {
        if (identifierPart1 === 'doz3') {
            return '3rd Dozen';
        }
        if (identifierPart1 === 'doz2') {
            return '2nd Dozen';
        }
        if (identifierPart1 === 'doz1') {
            return '1st Dozen';
        }
        if (identifierPart1 === 'col3') {
            return '3rd Column';
        }
        if (identifierPart1 === 'doz2') {
            return '2nd Column';
        }
        return '1st Column';
    }

    if (betType === 'x18') {
        if (identifierPart1 === 'high') {
            return '19-36';
        }
        if (identifierPart1 === 'low') {
            return '1-18';
        }
        if (identifierPart1 === 'red') {
            return 'Red';
        }
        if (identifierPart1 === 'black') {
            return 'Black';
        }
        if (identifierPart1 === 'odd') {
            return 'Odd';
        }
        return 'Even';
    }

    return null;
}

function createHotspots() {
    let isGreen = false;
    let index = 0;

    addHotSpot('x1-0', true, 61, 163, 'hotspot-inside');

    addHotSpot('x12-doz1', true, HOTSPOT_OUTSIDE_ABSOLUTE_LEFT, HOTSPOT_OUTSIDE_ABSOLUTE_TOP, 'hotspot-outside-dozen');
    addHotSpot('x12-doz2', false, HOTSPOT_OUTSIDE_ABSOLUTE_LEFT + HOTSPOT_OUTSIDE_DOZEN_WIDTH, HOTSPOT_OUTSIDE_ABSOLUTE_TOP, 'hotspot-outside-dozen');
    addHotSpot('x12-doz3', true, HOTSPOT_OUTSIDE_ABSOLUTE_LEFT + 2 * HOTSPOT_OUTSIDE_DOZEN_WIDTH, HOTSPOT_OUTSIDE_ABSOLUTE_TOP, 'hotspot-outside-dozen');

    addHotSpot('x12-col3', false, HOTSPOT_INSIDE_ABSOLUTE_LEFT + 24.6 * HOTSPOT_INSIDE_WIDTH, HOTSPOT_INSIDE_ABSOLUTE_TOP - 0.25 * HOTSPOT_OUTSIDE_COLUMN_HEIGHT, 'hotspot-outside-column');
    addHotSpot('x12-col2', true, HOTSPOT_INSIDE_ABSOLUTE_LEFT + 24.6 * HOTSPOT_INSIDE_WIDTH, HOTSPOT_INSIDE_ABSOLUTE_TOP + 0.75 * HOTSPOT_OUTSIDE_COLUMN_HEIGHT, 'hotspot-outside-column');
    addHotSpot('x12-col1', false, HOTSPOT_INSIDE_ABSOLUTE_LEFT + 24.6 * HOTSPOT_INSIDE_WIDTH, HOTSPOT_INSIDE_ABSOLUTE_TOP + 1.75 * HOTSPOT_OUTSIDE_COLUMN_HEIGHT, 'hotspot-outside-column');

    addHotSpot('x18-low', false, HOTSPOT_OUTSIDE_ABSOLUTE_LEFT, HOTSPOT_OUTSIDE_ABSOLUTE_TOP + HOTSPOT_OUTSIDE_HEIGHT, 'hotspot-outside-even-money');
    addHotSpot('x18-even', true, HOTSPOT_OUTSIDE_ABSOLUTE_LEFT + HOTSPOT_OUTSIDE_EVEN_MONEY_WIDTH, HOTSPOT_OUTSIDE_ABSOLUTE_TOP + HOTSPOT_OUTSIDE_HEIGHT, 'hotspot-outside-even-money');
    addHotSpot('x18-red', false, HOTSPOT_OUTSIDE_ABSOLUTE_LEFT + 2 * HOTSPOT_OUTSIDE_EVEN_MONEY_WIDTH, HOTSPOT_OUTSIDE_ABSOLUTE_TOP + HOTSPOT_OUTSIDE_HEIGHT, 'hotspot-outside-even-money');
    addHotSpot('x18-black', true, HOTSPOT_OUTSIDE_ABSOLUTE_LEFT + 3 * HOTSPOT_OUTSIDE_EVEN_MONEY_WIDTH, HOTSPOT_OUTSIDE_ABSOLUTE_TOP + HOTSPOT_OUTSIDE_HEIGHT, 'hotspot-outside-even-money');
    addHotSpot('x18-odd', false, HOTSPOT_OUTSIDE_ABSOLUTE_LEFT + 4 * HOTSPOT_OUTSIDE_EVEN_MONEY_WIDTH, HOTSPOT_OUTSIDE_ABSOLUTE_TOP + HOTSPOT_OUTSIDE_HEIGHT, 'hotspot-outside-even-money');
    addHotSpot('x18-high', true, HOTSPOT_OUTSIDE_ABSOLUTE_LEFT + 5 * HOTSPOT_OUTSIDE_EVEN_MONEY_WIDTH, HOTSPOT_OUTSIDE_ABSOLUTE_TOP + HOTSPOT_OUTSIDE_HEIGHT, 'hotspot-outside-even-money');

    // Create most Hotspots
    for (let i = 0; i < 24; i++) {
        isGreen = !isGreen;
        for (let j = 0; j < 6; j++) {
            let spot = i * 6 + j + 1;
            let left = i * HOTSPOT_INSIDE_WIDTH + HOTSPOT_INSIDE_ABSOLUTE_LEFT;
            let top = j * HOTSPOT_INSIDE_HEIGHT + HOTSPOT_INSIDE_ABSOLUTE_TOP;
            isGreen = !isGreen;

            if (index < HOTSPOT_IDENTIFIERS.length) {
                addHotSpot(HOTSPOT_IDENTIFIERS[index], isGreen, left, top, 'hotspot-inside');
            }
            else {
                addHotSpot('hotspot-' + spot, isGreen, left, top, 'hotspot-inside');
            }

            index++;
        }
    }
}

$(document).ready(function() {
    console.log('CREATING HOTSPOTS');
    createHotspots();
    console.log('READY FOR ACTION');
});