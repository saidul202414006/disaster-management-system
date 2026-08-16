-- ============================================================
-- APP_USER Table — Application-level authentication
-- NOTE: This is NOT part of the ER Diagram (which models disaster domain)
--       This is the system's authentication layer, added separately.
-- ============================================================
CREATE TABLE APP_USER (
    user_id         VARCHAR2(50)    PRIMARY KEY,
    email           VARCHAR2(200)   UNIQUE NOT NULL,
    password_hash   VARCHAR2(255)   NOT NULL,
    full_name       VARCHAR2(200)   NOT NULL,
    phone           VARCHAR2(20),
    role            VARCHAR2(20)    NOT NULL CHECK (role IN ('admin', 'victim')),
    is_verified     CHAR(1)         DEFAULT 'N' CHECK (is_verified IN ('Y', 'N')),
    otp_code        VARCHAR2(10),
    otp_expiry      DATE,
    created_at      DATE            DEFAULT SYSDATE,
    victim_id       VARCHAR2(50),
    FOREIGN KEY (victim_id) REFERENCES VICTIM(victim_id)
);

-- Verify
SELECT 'APP_USER table created successfully' AS status FROM DUAL;
COMMIT;
EXIT;
