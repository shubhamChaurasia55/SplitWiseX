CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    group_id UUID NOT NULL
        REFERENCES groups(id)
        ON DELETE CASCADE,

    description VARCHAR(255) NOT NULL,

    amount NUMERIC(12, 2) NOT NULL
        CHECK (amount > 0),

    paid_by UUID NOT NULL
        REFERENCES users(id),

    split_type VARCHAR(20) NOT NULL
        CHECK (
            split_type IN (
                'EQUAL',
                'EXACT',
                'PERCENTAGE'
            )
        ),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE expense_splits (
    expense_id UUID NOT NULL
        REFERENCES expenses(id)
        ON DELETE CASCADE,

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    amount NUMERIC(12, 2) NOT NULL
        CHECK (amount >= 0),

    percentage NUMERIC(5, 2),

    PRIMARY KEY (expense_id, user_id)
);