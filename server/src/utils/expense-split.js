export function calculateEqualSplit(
    amount,
    participantCount
) {
    const amountInPaise = Math.round(amount * 100);

    const baseShare = Math.floor(
        amountInPaise / participantCount
    );

    const remainder =
        amountInPaise % participantCount;

    // return Array.from(
    //     { length: participantCount },
    //     (_, index) => {
    //         const share =
    //             baseShare +
    //             (index < remainder ? 1 : 0);

    //         return share / 100;
    //     }
    // );

    const result = []

    for(let i=0; i<participantCount; i++){
        let share = baseShare;

        if(i<remainder){
            share += 1;
        }

        result.push(share/100);
    }
    return result;
}

export function validateExactSplit(
    amount,
    splits
) {
    const amountInPaise = Math.round(amount * 100);

    const splitTotal = splits.reduce(
        (total, split) => {
            return total + Math.round(split.amount * 100);
        },
        0
    );

    return splitTotal === amountInPaise;
}

export function calculatePercentageSplit(
    amount,
    splits
) {
    const amountInPaise = Math.round(amount * 100);

    const calculatedSplits = splits.map((split) => {
        const exactAmount =
            amountInPaise * split.percentage / 100;

        const baseAmount = Math.floor(exactAmount);

        const remainder = exactAmount - baseAmount;

        return {
            userId: split.userId,
            percentage: split.percentage,
            amountInPaise: baseAmount,
            remainder,
        };
    });


    // Calculate how many paise are still undistributed
    const distributedPaise = calculatedSplits.reduce(
        (total, split) => {
            return total + split.amountInPaise;
        },
        0
    );

    let remainingPaise =
        amountInPaise - distributedPaise;


    // Give remaining paise to the splits
    // with the largest fractional remainder
    calculatedSplits.sort(
        (a, b) => b.remainder - a.remainder
    );


    let index = 0;

    while (remainingPaise > 0) {

        calculatedSplits[index].amountInPaise += 1;

        remainingPaise--;

        index++;

        if (index === calculatedSplits.length) {
            index = 0;
        }
    }


    // Convert back to normal split format
    return calculatedSplits.map((split) => ({
        userId: split.userId,
        percentage: split.percentage,
        amount: split.amountInPaise / 100,
    }));
}