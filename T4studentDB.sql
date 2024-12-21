-- Create student table
CREATE TABLE student (
    fname CHAR(20),
    lname CHAR(20),
    email CHAR(50) PRIMARY KEY,
    password TEXT,
    id_student INT,
    avgteststu FLOAT,
    UNIQUE (fname, lname) -- Ensure fname and lname are unique in the student table
);

-- Create teacher table
CREATE TABLE teacher (
    fname CHAR(20),
    lname CHAR(20),
    email CHAR(50) PRIMARY KEY,
    password TEXT,
    count_student_take_quiz INT,
    cv_doctor TEXT,
    UNIQUE (fname, lname) -- Add a unique constraint for the combination of fname and lname
);

-- Create qustion table
CREATE TABLE qustion (
    fname CHAR(20),
    lname CHAR(20),
    major CHAR(20),
    course CHAR(20),
    id_q INT PRIMARY KEY,
    mid_final CHAR(20),
    FOREIGN KEY (fname, lname) REFERENCES teacher(fname, lname) -- Reference the composite key
);

-- Create student_qustion table
CREATE TABLE student_qustion (
    email CHAR(50) REFERENCES student(email),
    id_q INT REFERENCES qustion(id_q),
    PRIMARY KEY (email, id_q)
);

-- Create Qchoise table
CREATE TABLE Qchoise (
    id_q INT REFERENCES qustion(id_q),
    id_c INT PRIMARY KEY,
    true_c BOOLEAN,
    choise TEXT
);

-- Create qustion_Qchoise table
CREATE TABLE qustion_Qchoise (
    id_q INT REFERENCES qustion(id_q),
    id_c INT REFERENCES Qchoise(id_c),
    PRIMARY KEY (id_q, id_c)
);
