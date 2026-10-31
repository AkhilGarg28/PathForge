/**
 * PathForge Mock Question Bank: Data Analyst Track
 * Contains 60+ rigorous, verified questions across Beginner, Intermediate, and Advanced tiers.
 */

export const dataAnalystQuestions = [
  // ==========================================
  // Excel & Advanced Excel (Questions 1 - 10)
  // ==========================================
  {
    id: 'da-q01',
    track: 'data-analyst',
    skill: 'Excel',
    topic: 'Lookup Functions',
    difficulty: 'Beginner',
    question: 'Why is XLOOKUP considered superior to the traditional VLOOKUP function in modern Excel?',
    codeSnippet: `=XLOOKUP(lookup_value, lookup_array, return_array, [if_not_found], [match_mode])`,
    options: [
      'XLOOKUP can only search from right to left.',
      'XLOOKUP searches in any direction (left or right), defaults to an exact match, handles missing values cleanly, and does not break when columns are inserted.',
      'VLOOKUP is faster because it uses binary search by default.',
      'XLOOKUP requires enabling the Power Pivot add-in.'
    ],
    correctIndex: 1,
    explanation: 'Unlike VLOOKUP, which requires static column indices and can only look rightward, XLOOKUP searches in any direction, defaults to exact match, and is resilient to column insertion.'
  },
  {
    id: 'da-q02',
    track: 'data-analyst',
    skill: 'Excel',
    topic: 'INDEX and MATCH',
    difficulty: 'Intermediate',
    question: 'How do the INDEX and MATCH functions work together to perform dynamic 2D grid lookups in Excel?',
    codeSnippet: `=INDEX(data_range, MATCH(row_val, row_range, 0), MATCH(col_val, col_range, 0))`,
    options: [
      'MATCH returns the cell address; INDEX formats it as currency.',
      'MATCH finds the relative row and column position numbers; INDEX retrieves the value located at that coordinate intersection.',
      'INDEX sorts the dataset alphabetically before MATCH executes.',
      'They sum values across both rows and columns simultaneously.'
    ],
    correctIndex: 1,
    explanation: 'MATCH locates the numeric position of a lookup value in an array; INDEX extracts the value located at that specific row/column coordinate in the table.'
  },
  {
    id: 'da-q03',
    track: 'Excel',
    skill: 'Excel',
    topic: 'Pivot Tables',
    difficulty: 'Beginner',
    question: 'What is the function of the "Values" quadrant when constructing a Pivot Table in Excel?',
    codeSnippet: '',
    options: [
      'Filters the entire table by specific categorical criteria.',
      'Defines the numeric metrics to be aggregated (such as Sum, Average, or Count).',
      'Assigns row labels along the vertical axis.',
      'Exports the table into an external SQL database.'
    ],
    correctIndex: 1,
    explanation: 'The Values quadrant holds the data fields to be summarized, applying aggregation functions such as SUM, AVERAGE, COUNT, MIN, or MAX.'
  },
  {
    id: 'da-q04',
    track: 'data-analyst',
    skill: 'Excel',
    topic: 'Conditional Formatting',
    difficulty: 'Beginner',
    question: 'Which Excel feature dynamically changes cell background color or text formatting based on cell rules or custom formulas?',
    codeSnippet: '',
    options: ['Data Validation', 'Conditional Formatting', 'Goal Seek', 'Text to Columns'],
    correctIndex: 1,
    explanation: 'Conditional Formatting applies visual formatting rules (color scales, data bars, highlight rules) dynamically based on cell values or formula conditions.'
  },
  {
    id: 'da-q05',
    track: 'data-analyst',
    skill: 'Excel',
    topic: 'Logical Functions',
    difficulty: 'Intermediate',
    question: 'What does the Excel formula =IFS(A1>=90, "A", A1>=80, "B", A1>=70, "C", TRUE, "F") evaluate to if A1 contains 85?',
    codeSnippet: `=IFS(A1>=90, "A", A1>=80, "B", A1>=70, "C", TRUE, "F")`,
    options: ['"A"', '"B"', '"C"', '"F"'],
    correctIndex: 1,
    explanation: 'IFS evaluates conditions from left to right. A1>=90 is FALSE; A1>=80 is TRUE (85 >= 80), so it immediately returns "B" and stops evaluating.'
  },
  {
    id: 'da-q06',
    track: 'data-analyst',
    skill: 'Excel',
    topic: 'Data Cleaning & Text Functions',
    difficulty: 'Beginner',
    question: 'Which function removes all leading, trailing, and duplicate in-between spaces from a text string in Excel?',
    codeSnippet: `=TRIM("  Quarterly   Sales   Report   ")`,
    options: ['CLEAN()', 'TRIM()', 'SUBSTITUTE()', 'REPLACE()'],
    correctIndex: 1,
    explanation: 'TRIM removes leading and trailing spaces, and reduces multiple consecutive spaces between words to a single space.'
  },
  {
    id: 'da-q07',
    track: 'data-analyst',
    skill: 'Excel',
    topic: 'Power Query',
    difficulty: 'Intermediate',
    question: 'In Excel Power Query, what does the "Unpivot Columns" transformation achieve?',
    codeSnippet: '',
    options: [
      'Deletes all numeric columns from the table.',
      'Converts wide crosstab tables with repeated date/attribute headers into normalized tall, narrow attribute-value rows.',
      'Sorts columns in reverse alphabetical order.',
      'Converts numbers into text formatting.'
    ],
    correctIndex: 1,
    explanation: 'Unpivot transforms horizontal wide data (e.g. columns for Jan, Feb, Mar) into vertical tall relational rows (Attribute: Month, Value: Sales), optimal for Pivot Tables and BI.'
  },
  {
    id: 'da-q08',
    track: 'data-analyst',
    skill: 'Excel',
    topic: 'Statistical Formulas',
    difficulty: 'Intermediate',
    question: 'Which Excel function calculates the sample standard deviation of a dataset?',
    codeSnippet: '',
    options: ['STDEV.S()', 'STDEV.P()', 'VAR.S()', 'AVERAGE()'],
    correctIndex: 0,
    explanation: 'STDEV.S calculates standard deviation based on a sample (using n-1 degrees of freedom), while STDEV.P is reserved for entire populations (using n).'
  },
  {
    id: 'da-q09',
    track: 'data-analyst',
    skill: 'Excel',
    topic: 'What-If Analysis',
    difficulty: 'Advanced',
    question: 'Which What-If Analysis tool in Excel determines the exact input value required in a single formula cell to achieve a specific target outcome?',
    codeSnippet: '',
    options: ['Data Tables', 'Goal Seek', 'Scenario Manager', 'Consolidate'],
    correctIndex: 1,
    explanation: 'Goal Seek is an optimization tool that iteratively adjusts a single input cell until a formula dependent on that cell reaches a user-specified target value.'
  },
  {
    id: 'da-q10',
    track: 'data-analyst',
    skill: 'Excel',
    topic: 'Array Formulas & Dynamic Spilling',
    difficulty: 'Advanced',
    question: 'What is the behavior of modern Excel dynamic array formulas like =UNIQUE(A2:A100)?',
    codeSnippet: `=UNIQUE(A2:A100)`,
    options: [
      'They return an error unless entered with Ctrl+Shift+Enter.',
      'They dynamically spill all unique results into neighboring cells, automatically resizing if the source data changes.',
      'They permanently delete duplicate rows from the original worksheet.',
      'They can only be used on numerical numbers.'
    ],
    correctIndex: 1,
    explanation: 'In modern Excel calculation engines, dynamic array functions automatically spill results into adjacent empty cells without requiring legacy CSE (Ctrl+Shift+Enter).'
  },

  // ==========================================
  // SQL & Relational Databases (Questions 11 - 22)
  // ==========================================
  {
    id: 'da-q11',
    track: 'data-analyst',
    skill: 'SQL',
    topic: 'Joins',
    difficulty: 'Beginner',
    question: 'What rows are returned by an INNER JOIN between two tables (Customers and Orders) joined on CustomerID?',
    codeSnippet: `SELECT * FROM Customers c INNER JOIN Orders o ON c.CustomerID = o.CustomerID;`,
    options: [
      'All rows from Customers, with nulls for customers without orders.',
      'Only the rows where there is a matching CustomerID value present in BOTH tables.',
      'All rows from both tables, combining every row with every other row (Cartesian product).',
      'Only rows from Customers that have no orders.'
    ],
    correctIndex: 1,
    explanation: 'INNER JOIN returns only rows that satisfy the join condition with matching keys in both participating tables, discarding non-matching rows.'
  },
  {
    id: 'da-q12',
    track: 'data-analyst',
    skill: 'SQL',
    topic: 'GROUP BY and HAVING',
    difficulty: 'Beginner',
    question: 'What is the critical semantic difference between the WHERE clause and the HAVING clause in SQL?',
    codeSnippet: `SELECT department, COUNT(*) FROM employees WHERE salary > 50000 GROUP BY department HAVING COUNT(*) > 5;`,
    options: [
      'WHERE filters individual rows BEFORE aggregation; HAVING filters aggregated groups AFTER aggregation.',
      'HAVING filters individual rows; WHERE filters groups.',
      'WHERE can only be used on numbers; HAVING is for text strings.',
      'There is no difference; they can be used interchangeably.'
    ],
    correctIndex: 0,
    explanation: 'WHERE filters raw rows before the GROUP BY aggregation occurs; HAVING filters the aggregated summary results after grouping.'
  },
  {
    id: 'da-q13',
    track: 'data-analyst',
    skill: 'SQL',
    topic: 'Window Functions - Ranking',
    difficulty: 'Intermediate',
    question: 'Given rows with identical values (e.g. scores 100, 90, 90, 80), what ranks are assigned by RANK() vs DENSE_RANK()?',
    codeSnippet: `SELECT score, RANK() OVER (ORDER BY score DESC), DENSE_RANK() OVER (ORDER BY score DESC) FROM results;`,
    options: [
      'RANK: 1, 2, 2, 4 (gaps after ties); DENSE_RANK: 1, 2, 2, 3 (no gaps after ties).',
      'RANK: 1, 2, 3, 4; DENSE_RANK: 1, 1, 1, 1.',
      'DENSE_RANK leaves gaps; RANK never leaves gaps.',
      'Both functions assign identical consecutive numbers.'
    ],
    correctIndex: 0,
    explanation: 'RANK skips rank numbers after tied positions (1, 2, 2, 4), while DENSE_RANK assigns consecutive numbers without gaps (1, 2, 2, 3).'
  },
  {
    id: 'da-q14',
    track: 'data-analyst',
    skill: 'SQL',
    topic: 'Window Functions - Navigation',
    difficulty: 'Intermediate',
    question: 'Which SQL window function retrieves a value from the preceding row without performing a self-join, ideal for calculating period-over-period growth?',
    codeSnippet: `SELECT date, revenue, LAG(revenue, 1) OVER (ORDER BY date) AS prev_revenue FROM daily_sales;`,
    options: ['LEAD()', 'LAG()', 'FIRST_VALUE()', 'ROW_NUMBER()'],
    correctIndex: 1,
    explanation: 'LAG() accesses data from a previous row at a specified physical offset within the window partition, enabling period-over-period delta calculations.'
  },
  {
    id: 'da-q15',
    track: 'data-analyst',
    skill: 'SQL',
    topic: 'Common Table Expressions (CTEs)',
    difficulty: 'Intermediate',
    question: 'What is the primary benefit of Common Table Expressions (WITH clause) over deeply nested subqueries?',
    codeSnippet: `WITH RegionalSales AS (\n  SELECT region, SUM(amount) AS total FROM sales GROUP BY region\n)\nSELECT * FROM RegionalSales WHERE total > 100000;`,
    options: [
      'CTEs permanently save data into new physical hard drive tables.',
      'CTEs improve query readability, modularity, and can be referenced multiple times or recursively.',
      'CTEs disable query caching in the database engine.',
      'CTEs prevent other users from reading the database.'
    ],
    correctIndex: 1,
    explanation: 'CTEs (Common Table Expressions) provide named temporary result sets that dramatically enhance readability, maintainability, and allow recursive hierarchical queries.'
  },
  {
    id: 'da-q16',
    track: 'data-analyst',
    skill: 'SQL',
    topic: 'Handling NULL Values',
    difficulty: 'Beginner',
    question: 'Why does the query "SELECT * FROM users WHERE status != \'active\';" fail to return users whose status is NULL?',
    codeSnippet: `SELECT * FROM users WHERE status != 'active';`,
    options: [
      'In SQL three-valued logic (3VL), comparisons with NULL evaluate to UNKNOWN, not TRUE.',
      'NULL is treated as an active status by default.',
      'SQL does not allow strings in WHERE clauses.',
      'The database deletes rows containing NULL values.'
    ],
    correctIndex: 0,
    explanation: 'SQL uses three-valued logic (TRUE, FALSE, UNKNOWN). Comparing NULL with != returns UNKNOWN, which the WHERE clause filters out. One must write (status != \'active\' OR status IS NULL).'
  },
  {
    id: 'da-q17',
    track: 'data-analyst',
    skill: 'SQL',
    topic: 'UNION vs UNION ALL',
    difficulty: 'Beginner',
    question: 'What is the operational difference between UNION and UNION ALL in SQL?',
    codeSnippet: '',
    options: [
      'UNION merges columns horizontally; UNION ALL merges rows vertically.',
      'UNION combines result sets and removes duplicate rows (requires sorting/hashing); UNION ALL combines all rows including duplicates, executing faster.',
      'UNION ALL deletes the underlying tables after merging.',
      'UNION only works on tables with identical names.'
    ],
    correctIndex: 1,
    explanation: 'UNION performs a deduplication step to return distinct rows, adding processing overhead. UNION ALL retains all rows including duplicates and is significantly faster.'
  },
  {
    id: 'da-q18',
    track: 'data-analyst',
    skill: 'SQL',
    topic: 'Self Joins',
    difficulty: 'Intermediate',
    question: 'When is a SELF JOIN most typically applied in data analysis?',
    codeSnippet: `SELECT e.name AS employee, m.name AS manager\nFROM Employees e\nLEFT JOIN Employees m ON e.ManagerID = m.EmployeeID;`,
    options: [
      'When copying data to an external backup database.',
      'When querying hierarchical or parent-child relationships where records reference other records in the same table (e.g. Employee and Manager).',
      'When deleting duplicate primary keys.',
      'When encrypting sensitive columns.'
    ],
    correctIndex: 1,
    explanation: 'Self-joins join a table to itself using aliasing, essential for querying hierarchies, trees, or comparing rows within the same dataset (e.g. employee-manager hierarchies).'
  },
  {
    id: 'da-q19',
    track: 'data-analyst',
    skill: 'SQL',
    topic: 'Indexing & EXPLAIN Plans',
    difficulty: 'Advanced',
    question: 'What does the EXPLAIN or EXPLAIN ANALYZE command reveal about a SQL query?',
    codeSnippet: `EXPLAIN ANALYZE SELECT * FROM orders WHERE customer_id = 501;`,
    options: [
      'Translates the SQL query into natural English sentences.',
      'Shows the database execution plan, including index usage, scan types (Index Scan vs Seq Scan), cost estimates, and actual execution time.',
      'Automatically rewrites the query into Python code.',
      'Exports query results directly into an Excel spreadsheet.'
    ],
    correctIndex: 1,
    explanation: 'EXPLAIN details the query optimizer\'s execution strategy (indexes used, join algorithms, estimated/actual execution costs), crucial for database performance tuning.'
  },
  {
    id: 'da-q20',
    track: 'data-analyst',
    skill: 'SQL',
    topic: 'Subqueries (Correlated vs Non-Correlated)',
    difficulty: 'Advanced',
    question: 'What distinguishes a correlated subquery from a standard non-correlated subquery?',
    codeSnippet: `SELECT e.name, e.salary FROM employees e\nWHERE e.salary > (SELECT AVG(salary) FROM employees WHERE department = e.department);`,
    options: [
      'Correlated subqueries execute once for the entire query.',
      'Correlated subqueries reference columns from the outer query and must be evaluated repeatedly for each row processed by the outer query.',
      'Correlated subqueries cannot be used in WHERE clauses.',
      'Correlated subqueries only work on temporary tables.'
    ],
    correctIndex: 1,
    explanation: 'A correlated subquery references values from the outer query, meaning it depends on the outer row and is evaluated row-by-row, which can impact performance if unindexed.'
  },
  {
    id: 'da-q21',
    track: 'data-analyst',
    skill: 'SQL',
    topic: 'String Manipulation & Parsing',
    difficulty: 'Intermediate',
    question: 'In SQL, which function extracts a substring from a text column based on a starting position and character length?',
    codeSnippet: `SELECT SUBSTRING(phone_number, 1, 3) AS area_code FROM contacts;`,
    options: ['SPLIT()', 'SUBSTRING() (or SUBSTR())', 'CONCAT()', 'TRIM()'],
    correctIndex: 1,
    explanation: 'SUBSTRING (or SUBSTR in Oracle/SQLite) extracts a designated slice of a string starting at a specified character index for a given length.'
  },
  {
    id: 'da-q22',
    track: 'data-analyst',
    skill: 'SQL',
    topic: 'CASE WHEN Statements',
    difficulty: 'Beginner',
    question: 'What is the SQL syntax construct used to implement conditional if-then-else logic within a SELECT statement?',
    codeSnippet: `SELECT order_id, CASE WHEN amount > 1000 THEN 'VIP' ELSE 'Standard' END AS tier FROM orders;`,
    options: ['IF...THEN...ELSE', 'CASE WHEN ... THEN ... ELSE ... END', 'SWITCH...CASE', 'DECODE_IF()'],
    correctIndex: 1,
    explanation: 'SQL uses CASE WHEN condition THEN result ELSE fallback END to perform conditional branching in projection and ordering operations.'
  },

  // ==========================================
  // Power BI, Tableau & Data Modeling (Questions 23 - 32)
  // ==========================================
  {
    id: 'da-q23',
    track: 'data-analyst',
    skill: 'Power BI',
    topic: 'Calculated Columns vs Measures (DAX)',
    difficulty: 'Intermediate',
    question: 'In Power BI DAX, what is the core architectural difference between a Calculated Column and a Measure?',
    codeSnippet: '',
    options: [
      'Calculated Columns are computed row-by-row during data refresh and stored in memory; Measures are computed dynamically on-the-fly based on report filter context.',
      'Measures increase the .pbix file size significantly; Calculated Columns do not.',
      'Calculated Columns can only calculate sums; Measures can only calculate counts.',
      'There is no difference; they are synonymous in Power BI.'
    ],
    correctIndex: 0,
    explanation: 'Calculated Columns evaluate row-by-row and consume RAM in the data model. Measures evaluate dynamically at query time based on user slicers and filter context.'
  },
  {
    id: 'da-q24',
    track: 'data-analyst',
    skill: 'Power BI',
    topic: 'DAX CALCULATE Function',
    difficulty: 'Intermediate',
    question: 'Why is CALCULATE considered the most important function in DAX?',
    codeSnippet: `Total Sales West = CALCULATE(SUM(Sales[Amount]), Regions[Name] = "West")`,
    options: [
      'It is the only function that can perform basic addition.',
      'It modifies, overrides, or transitions the filter context of an expression during evaluation.',
      'It translates DAX code into SQL queries.',
      'It automatically exports visuals to PDF format.'
    ],
    correctIndex: 1,
    explanation: 'CALCULATE evaluates an expression in a modified filter context, enabling analysts to override or augment report filters (e.g. calculating percentage of total or year-to-date).'
  },
  {
    id: 'da-q25',
    track: 'data-analyst',
    skill: 'Data Modeling',
    topic: 'Star Schema vs Snowflake Schema',
    difficulty: 'Intermediate',
    question: 'Why is a Star Schema generally preferred over a normalized Snowflake Schema in dimensional data modeling for Power BI?',
    codeSnippet: '',
    options: [
      'Star Schemas contain fewer table joins, improving query performance and simplifying DAX formulas for the VertiPaq engine.',
      'Snowflake schemas cannot store date dimensions.',
      'Star schemas eliminate the need for Fact tables.',
      'Power BI cannot connect to normalized databases.'
    ],
    correctIndex: 0,
    explanation: 'Star schemas feature a central Fact table surrounded by de-normalized Dimension tables. Fewer table relationships maximize columnar compression and query speed.'
  },
  {
    id: 'da-q26',
    track: 'data-analyst',
    skill: 'Tableau',
    topic: 'Level of Detail (LOD) Expressions',
    difficulty: 'Advanced',
    question: 'In Tableau, what is the function of a {FIXED [Region] : SUM([Sales])} LOD expression?',
    codeSnippet: `{ FIXED [Region] : SUM([Sales]) }`,
    options: [
      'Locks the visual so other users cannot filter it.',
      'Computes the sum of sales at the Region level of granularity, completely independent of whatever other dimensions are present in the view.',
      'Calculates sales for the entire dataset without grouping.',
      'Deletes all regions with zero sales.'
    ],
    correctIndex: 1,
    explanation: 'FIXED LOD expressions compute an aggregate value using only the specified dimensions, ignoring other dimension filters and level of detail in the view.'
  },
  {
    id: 'da-q27',
    track: 'data-analyst',
    skill: 'Tableau',
    topic: 'Dimensions vs Measures',
    difficulty: 'Beginner',
    question: 'In Tableau, what visual distinction indicates whether a field is a discrete Dimension versus a continuous Measure?',
    codeSnippet: '',
    options: [
      'Dimensions are blue pills (discrete); Measures are green pills (continuous).',
      'Measures are always red; Dimensions are yellow.',
      'Dimensions are stored in cloud storage; Measures are stored in RAM.',
      'Dimensions have no visual color indicators.'
    ],
    correctIndex: 0,
    explanation: 'Tableau uses Blue pills to represent Discrete fields (which create row/column headers) and Green pills to represent Continuous fields (which generate axes).'
  },
  {
    id: 'da-q28',
    track: 'data-analyst',
    skill: 'Power BI',
    topic: 'Time Intelligence Functions',
    difficulty: 'Intermediate',
    question: 'What is a strict prerequisite for using Power BI DAX Time Intelligence functions (such as TOTALYTD or SAMEPERIODLASTYEAR)?',
    codeSnippet: `Sales YTD = TOTALYTD(SUM(Sales[Amount]), 'Date'[Date])`,
    options: [
      'The data model must include a dedicated Date Dimension table with continuous, contiguous dates and no missing days.',
      'The report must be refreshed exclusively at midnight.',
      'Dates must be formatted as UNIX timestamps.',
      'The server must be located in UTC time zone.'
    ],
    correctIndex: 0,
    explanation: 'DAX time intelligence requires a contiguous Date table containing uninterrupted daily records covering the entire multi-year range, marked as a Date Table.'
  },
  {
    id: 'da-q29',
    track: 'data-analyst',
    skill: 'Data Modeling',
    topic: 'Relationships & Cardinality',
    difficulty: 'Beginner',
    question: 'In data modeling, what does a "One-to-Many" (1:*) relationship between Customers and Orders indicate?',
    codeSnippet: '',
    options: [
      'One customer can only ever place exactly one order.',
      'One customer can place multiple orders, but each order is associated with exactly one customer.',
      'Orders can exist without any associated customer.',
      'Multiple customers can share the exact same order record.'
    ],
    correctIndex: 1,
    explanation: 'A 1:* relationship establishes that the primary key in the Dimension table (Customer) maps to multiple foreign key occurrences in the Fact table (Orders).'
  },
  {
    id: 'da-q30',
    track: 'data-analyst',
    skill: 'Power BI',
    topic: 'Row-Level Security (RLS)',
    difficulty: 'Advanced',
    question: 'How is Row-Level Security (RLS) configured in Power BI to restrict data access based on user login?',
    codeSnippet: `[Region] = USERNAME()`,
    options: [
      'By creating separate dashboard files for every single employee.',
      'By defining roles with DAX filter rules on tables, and mapping Azure AD users or groups to those roles in Power BI Service.',
      'By locking the screen with a PIN number.',
      'RLS can only be configured in SQL Server, not Power BI.'
    ],
    correctIndex: 1,
    explanation: 'Power BI RLS filters table rows dynamically based on DAX expressions (using USERNAME() or USERPRINCIPALNAME()) mapped to security roles in Power BI Service.'
  },
  {
    id: 'da-q31',
    track: 'data-analyst',
    skill: 'Tableau',
    topic: 'Parameters in Dashboards',
    difficulty: 'Intermediate',
    question: 'What is a Parameter in Tableau and how does it empower interactive dashboards?',
    codeSnippet: '',
    options: [
      'A static visual background theme.',
      'A workbook variable (number, date, or string) that users can dynamically adjust via controls to drive calculated fields, top-N filters, or reference lines.',
      'An encrypted license key.',
      'A method to delete unneeded columns.'
    ],
    correctIndex: 1,
    explanation: 'Parameters are user-controlled dynamic variables that can feed into calculations, filters, and reference lines, allowing interactive "what-if" scenarios.'
  },
  {
    id: 'da-q32',
    track: 'data-analyst',
    skill: 'Data Modeling',
    topic: 'Granularity',
    difficulty: 'Intermediate',
    question: 'What does "data granularity" refer to in business intelligence and data warehousing?',
    codeSnippet: '',
    options: [
      'The physical resolution (DPI) of dashboard charts.',
      'The level of detail or depth represented by a single record in a data table (e.g. per transaction, per day, or per store).',
      'The color palette applied to reports.',
      'The file size of the database on disk.'
    ],
    correctIndex: 1,
    explanation: 'Granularity defines the lowest level of detail represented by a table\'s rows (atomic transaction level vs summarized daily/monthly aggregations).'
  },

  // ==========================================
  // Python, Pandas & NumPy (Questions 33 - 44)
  // ==========================================
  {
    id: 'da-q33',
    track: 'data-analyst',
    skill: 'Python',
    topic: 'Pandas Indexing: loc vs iloc',
    difficulty: 'Beginner',
    question: 'What is the distinction between df.loc[] and df.iloc[] when indexing a Pandas DataFrame?',
    codeSnippet: `df.loc[0:2, 'Revenue']\ndf.iloc[0:2, 1]`,
    options: [
      'df.loc uses label-based indexing (inclusive of end labels); df.iloc uses integer position-based indexing (exclusive of end index).',
      'df.loc is for column deletion; df.iloc is for row deletion.',
      'df.iloc is only used for strings; df.loc is for numbers.',
      'There is no difference; they are interchangeable.'
    ],
    correctIndex: 0,
    explanation: 'df.loc indexes by row/column index labels and includes the stop boundary. df.iloc indexes purely by 0-based integer position offsets and excludes the stop boundary.'
  },
  {
    id: 'da-q34',
    track: 'data-analyst',
    skill: 'Python',
    topic: 'Handling Missing Values',
    difficulty: 'Beginner',
    question: 'In Pandas, which method fills NaN (missing) values with a designated replacement value (e.g. 0 or column mean)?',
    codeSnippet: `df['revenue'].fillna(df['revenue'].median(), inplace=True)`,
    options: ['df.dropna()', 'df.fillna()', 'df.replace_null()', 'df.isna()'],
    correctIndex: 1,
    explanation: 'fillna() imputes missing values (NaN/None) with specified constants, statistics (mean, median), or forward/backward fills.'
  },
  {
    id: 'da-q35',
    track: 'data-analyst',
    skill: 'Python',
    topic: 'Pandas GroupBy & Aggregations',
    difficulty: 'Intermediate',
    question: 'How do you calculate multiple distinct aggregations (e.g. mean sales and total quantity) per category in Pandas?',
    codeSnippet: `df.groupby('category').agg({'sales': 'mean', 'quantity': 'sum'})`,
    options: [
      'By using df.groupby(\'category\').agg({\'sales\': \'mean\', \'quantity\': \'sum\'})',
      'By calling df.sum().mean()',
      'GroupBy cannot calculate more than one metric simultaneously.',
      'By converting the dataframe into a Python tuple.'
    ],
    correctIndex: 0,
    explanation: 'The .agg() method allows passing a dictionary mapping column names to desired aggregation functions (\'mean\', \'sum\', \'count\', etc.).'
  },
  {
    id: 'da-q36',
    track: 'data-analyst',
    skill: 'Python',
    topic: 'NumPy Vectorization',
    difficulty: 'Intermediate',
    question: 'Why are vectorized NumPy operations significantly faster than standard Python "for" loops over numeric arrays?',
    codeSnippet: `import numpy as np\na = np.array([1, 2, 3])\nb = a * 2  # Vectorized operation`,
    options: [
      'NumPy operations run in C-level contiguous memory arrays with optimized SIMD processor instructions, avoiding Python interpreter overhead.',
      'Python for loops automatically compress memory.',
      'NumPy saves calculations to disk before running.',
      'NumPy converts all data to strings.'
    ],
    correctIndex: 0,
    explanation: 'NumPy arrays store elements contiguously in homogeneous memory buffers, enabling vectorized pre-compiled C/Fortran routines and SIMD hardware parallelism.'
  },
  {
    id: 'da-q37',
    track: 'data-analyst',
    skill: 'Python',
    topic: 'Merging & Joining DataFrames',
    difficulty: 'Intermediate',
    question: 'Which Pandas function combines two DataFrames along a common key column, functioning analogously to SQL JOINs?',
    codeSnippet: `pd.merge(orders_df, customers_df, on='customer_id', how='left')`,
    options: ['pd.concat()', 'pd.merge()', 'pd.append()', 'pd.split()'],
    correctIndex: 1,
    explanation: 'pd.merge() merges DataFrames based on keys using database-style join logic (inner, left, right, outer), whereas pd.concat() stacks dataframes along an axis.'
  },
  {
    id: 'da-q38',
    track: 'data-analyst',
    skill: 'Python',
    topic: 'Method: apply() vs Vectorized Functions',
    difficulty: 'Advanced',
    question: 'Why should vectorized functions (e.g. np.where) be preferred over df.apply(lambda x: ...) for large datasets in Pandas?',
    codeSnippet: `df['status'] = np.where(df['age'] >= 18, 'Adult', 'Minor')`,
    options: [
      'df.apply() iterates row-by-row in pure Python, incurring heavy interpreter overhead, whereas np.where operates on contiguous memory blocks.',
      'np.where deletes missing values automatically.',
      'df.apply() cannot handle string returns.',
      'They perform identically in all benchmarks.'
    ],
    correctIndex: 0,
    explanation: 'df.apply() with a Python lambda essentially executes a Python loop behind the scenes. Vectorized NumPy functions operate orders of magnitude faster directly in C.'
  },
  {
    id: 'da-q39',
    track: 'data-analyst',
    skill: 'Python',
    topic: 'Data Type Conversions & Memory Optimization',
    difficulty: 'Intermediate',
    question: 'How can a Data Analyst reduce the RAM footprint of a DataFrame containing repetitive string categories (e.g. "North", "South", "East", "West")?',
    codeSnippet: `df['region'] = df['region'].astype('category')`,
    options: [
      'Convert the column to the "category" dtype, which replaces repeated strings with integer code lookups.',
      'Convert the strings into floating-point numbers.',
      'Delete the column entirely.',
      'Save the DataFrame as a CSV file.'
    ],
    correctIndex: 0,
    explanation: 'Converting low-cardinality string columns to the category dtype replaces string pointers with small integer keys referencing an internal dictionary, drastically cutting memory usage.'
  },
  {
    id: 'da-q40',
    track: 'data-analyst',
    skill: 'Python',
    topic: 'DateTime Manipulation in Pandas',
    difficulty: 'Beginner',
    question: 'How do you extract the month name or year from a DateTime column in Pandas?',
    codeSnippet: `df['month'] = df['order_date'].dt.month_name()`,
    options: [
      'By using the .str accessor.',
      'By converting the column with pd.to_datetime() and using the .dt accessor (.dt.year, .dt.month_name()).',
      'By writing a regex for every date.',
      'Pandas cannot parse dates.'
    ],
    correctIndex: 1,
    explanation: 'The .dt accessor exposes rich datetime properties and methods (year, month, day, dayofweek, month_name) once converted to datetime64 format.'
  },
  {
    id: 'da-q41',
    track: 'data-analyst',
    skill: 'Python',
    topic: 'Pivoting & Melting',
    difficulty: 'Intermediate',
    question: 'What is the function of pd.melt() in Pandas?',
    codeSnippet: `pd.melt(df, id_vars=['date'], value_vars=['sales', 'expenses'])`,
    options: [
      'Deletes null values.',
      'Unpivots a DataFrame from wide format to long format, gathering columns into key-value pairs.',
      'Pivots rows into columns.',
      'Exports the dataframe to a Parquet file.'
    ],
    correctIndex: 1,
    explanation: 'pd.melt() reshapes wide data into tidy long format by transforming column headers into variable and value rows.'
  },
  {
    id: 'da-q42',
    track: 'data-analyst',
    skill: 'Python',
    topic: 'Removing Duplicates',
    difficulty: 'Beginner',
    question: 'Which Pandas method identifies and drops duplicate rows based on specific subset columns?',
    codeSnippet: `df.drop_duplicates(subset=['customer_id', 'email'], keep='first', inplace=True)`,
    options: ['df.drop_duplicates()', 'df.remove_repeats()', 'df.distinct()', 'df.filter_unique()'],
    correctIndex: 0,
    explanation: 'drop_duplicates() detects duplicate rows across the entire DataFrame or specified subset columns and keeps either the first, last, or drops all duplicates.'
  },
  {
    id: 'da-q43',
    track: 'data-analyst',
    skill: 'Python',
    topic: 'NumPy Boolean Masking',
    difficulty: 'Beginner',
    question: 'What does the expression arr[arr > 50] return in NumPy?',
    codeSnippet: `import numpy as np\narr = np.array([10, 45, 60, 80, 25])\nfiltered = arr[arr > 50]`,
    options: [
      'A boolean array of True and False values.',
      'A 1D array containing only the elements that satisfy the condition (60 and 80).',
      'The count of numbers greater than 50.',
      'Throws a ValueError exception.'
    ],
    correctIndex: 1,
    explanation: 'Passing a boolean comparison condition inside square brackets indexes the array via boolean masking, returning a filtered array containing only matching elements.'
  },
  {
    id: 'da-q44',
    track: 'data-analyst',
    skill: 'Python',
    topic: 'Data Export & Storage Formats',
    difficulty: 'Intermediate',
    question: 'Why is Parquet (.parquet) format generally preferred over CSV for storing large analytics datasets?',
    codeSnippet: `df.to_parquet('analytics_data.parquet', compression='snappy')`,
    options: [
      'Parquet files can be opened in simple text editors like Notepad.',
      'Parquet is a binary columnar format that provides superior compression, embeds data schemas, and supports column projection pushdown.',
      'CSV files are limited to 1000 rows.',
      'Parquet files do not require any Python library to read.'
    ],
    correctIndex: 1,
    explanation: 'Apache Parquet organizes data column-by-column rather than row-by-row, achieving 80%+ file compression and allowing query engines to scan only requested columns.'
  },

  // ==========================================
  // Statistics & Probability (Questions 45 - 52)
  // ==========================================
  {
    id: 'da-q45',
    track: 'data-analyst',
    skill: 'Statistics',
    topic: 'Central Tendency & Skewness',
    difficulty: 'Beginner',
    question: 'In a right-skewed (positively skewed) distribution of salaries, what is the typical relationship between Mean and Median?',
    codeSnippet: '',
    options: [
      'Mean is greater than Median, because extreme high earners pull the mean to the right.',
      'Median is greater than Mean.',
      'Mean and Median are perfectly identical.',
      'Standard deviation is negative.'
    ],
    correctIndex: 0,
    explanation: 'Extreme outliers in the right tail inflate the arithmetic mean, whereas the median remains robust and resistant to outlier distortion, making Mean > Median.'
  },
  {
    id: 'da-q46',
    track: 'data-analyst',
    skill: 'Statistics',
    topic: 'Hypothesis Testing & p-values',
    difficulty: 'Intermediate',
    question: 'In statistical hypothesis testing, what does a p-value of 0.03 indicate when testing at a significance level of alpha = 0.05?',
    codeSnippet: '',
    options: [
      'There is a 3% probability that the null hypothesis is true.',
      'The probability of observing results as extreme as the sample data (assuming the null hypothesis is true) is 3%; since p < 0.05, we reject the null hypothesis.',
      'The test is invalid and must be rerun.',
      'We fail to reject the null hypothesis because 0.03 is less than 0.05.'
    ],
    correctIndex: 1,
    explanation: 'A p-value is the probability of observing data at least as extreme as observed under the null hypothesis. When p < alpha (0.03 < 0.05), we reject H0 as statistically significant.'
  },
  {
    id: 'da-q47',
    track: 'data-analyst',
    skill: 'Statistics',
    topic: 'Central Limit Theorem (CLT)',
    difficulty: 'Intermediate',
    question: 'What does the Central Limit Theorem state regarding sample means drawn from ANY population distribution with finite variance?',
    codeSnippet: '',
    options: [
      'The original population must follow a normal bell curve.',
      'As sample size (n) becomes sufficiently large (typically n >= 30), the distribution of sample means approximates a normal distribution regardless of the population\'s shape.',
      'Sample variance always equals population variance.',
      'Outliers are automatically removed from large datasets.'
    ],
    correctIndex: 1,
    explanation: 'The Central Limit Theorem demonstrates that given sufficiently large samples (n >= 30), the distribution of sample means approaches a normal distribution regardless of population skew.'
  },
  {
    id: 'da-q48',
    track: 'data-analyst',
    skill: 'Statistics',
    topic: 'Type I vs Type II Errors',
    difficulty: 'Intermediate',
    question: 'What is a Type I error (False Positive) in data experimentation and A/B testing?',
    codeSnippet: '',
    options: [
      'Rejecting a true null hypothesis (detecting a difference/effect when none actually exists).',
      'Failing to reject a false null hypothesis (missing a real effect).',
      'Making a calculation typo in an Excel spreadsheet.',
      'Sampling too many users in an experiment.'
    ],
    correctIndex: 0,
    explanation: 'A Type I error occurs when researchers reject a true null hypothesis (false alarm / false positive), with probability denoted by alpha (significance level).'
  },
  {
    id: 'da-q49',
    track: 'data-analyst',
    skill: 'Statistics',
    topic: 'Z-score & Standardization',
    difficulty: 'Beginner',
    question: 'What does a Z-score of +2.5 indicate about a specific data point?',
    codeSnippet: `z = (x - mu) / sigma`,
    options: [
      'The value is 2.5 times larger than the median.',
      'The value lies 2.5 standard deviations above the mean of the distribution.',
      'The data point represents a 25% error rate.',
      'The data point is negative.'
    ],
    correctIndex: 1,
    explanation: 'A Z-score measures the exact number of standard deviations an individual observation lies above (+) or below (-) the mean of the dataset.'
  },
  {
    id: 'da-q50',
    track: 'data-analyst',
    skill: 'Statistics',
    topic: 'Correlation vs Causation',
    difficulty: 'Beginner',
    question: 'If two variables have a high Pearson correlation coefficient (r = 0.89), what can a Data Analyst validly conclude?',
    codeSnippet: '',
    options: [
      'Changes in variable X cause changes in variable Y.',
      'There is a strong linear association between X and Y, but correlation does not imply causation (it could be driven by lurking confounding variables).',
      'Variable Y will double whenever variable X doubles.',
      'Both variables are normally distributed.'
    ],
    correctIndex: 1,
    explanation: 'A strong positive correlation measures linear co-movement between two variables, but cannot establish causal relationships without controlled experiments or causal inference.'
  },
  {
    id: 'da-q51',
    track: 'data-analyst',
    skill: 'Statistics',
    topic: 'Variance & Standard Deviation',
    difficulty: 'Beginner',
    question: 'Why is Standard Deviation commonly preferred over Variance when presenting dispersion insights to business stakeholders?',
    codeSnippet: '',
    options: [
      'Standard deviation is expressed in the same original measurement units as the data, whereas variance is in squared units.',
      'Variance is always zero for financial data.',
      'Standard deviation is easier for computers to compute.',
      'Variance can only be calculated on percentages.'
    ],
    correctIndex: 0,
    explanation: 'Variance squares deviations from the mean (yielding squared units like dollars squared), whereas standard deviation takes the square root, returning to interpretable natural units (dollars).'
  },
  {
    id: 'da-q52',
    track: 'data-analyst',
    skill: 'Statistics',
    topic: 'Confidence Intervals',
    difficulty: 'Advanced',
    question: 'What is the correct interpretation of a "95% Confidence Interval for mean revenue is [$450, $520]"?',
    codeSnippet: '',
    options: [
      'There is a 95% probability that the next customer spends between $450 and $520.',
      'If we repeated the sampling procedure many times, 95% of the calculated confidence intervals would contain the true population mean.',
      '95% of all daily revenue values fall between $450 and $520.',
      'The sample mean is guaranteed to be $485.'
    ],
    correctIndex: 1,
    explanation: 'In frequentist statistics, a 95% CI means that under repeated sampling, 95% of intervals constructed with this methodology will encompass the true fixed population parameter.'
  },

  // ==========================================
  // Data Cleaning, Visualization & Analytics (Questions 53 - 60)
  // ==========================================
  {
    id: 'da-q53',
    track: 'data-analyst',
    skill: 'Data Cleaning',
    topic: 'Outlier Detection via IQR',
    difficulty: 'Intermediate',
    question: 'In exploratory data analysis, how are outlier fences calculated using the Interquartile Range (IQR)?',
    codeSnippet: `IQR = Q3 - Q1\nLower Fence = Q1 - 1.5 * IQR\nUpper Fence = Q3 + 1.5 * IQR`,
    options: [
      'Values smaller than Q1 - 1.5*IQR or greater than Q3 + 1.5*IQR are identified as potential outliers.',
      'Values within 1 standard deviation of the median.',
      'Any value that occurs only once in the dataset.',
      'Values greater than the mean plus 5.'
    ],
    correctIndex: 0,
    explanation: 'Tukey\'s boxplot rule establishes the lower fence at Q1 - 1.5*IQR and upper fence at Q3 + 1.5*IQR. Observations beyond these boundaries are flagged as outliers.'
  },
  {
    id: 'da-q54',
    track: 'data-analyst',
    skill: 'Data Visualization',
    topic: 'Chart Selection',
    difficulty: 'Beginner',
    question: 'Which chart type is best suited for displaying the distribution and spread of continuous numerical data across quartiles, medians, and outliers?',
    codeSnippet: '',
    options: ['Pie Chart', 'Box Plot (Box-and-Whisker)', 'Donut Chart', 'Stacked Area Chart'],
    correctIndex: 1,
    explanation: 'A Box Plot provides a five-number summary (Min, Q1, Median, Q3, Max) and visually highlights outliers and distribution skew across categories.'
  },
  {
    id: 'da-q55',
    track: 'data-analyst',
    skill: 'Data Visualization',
    topic: 'Data Storytelling & Perception',
    difficulty: 'Beginner',
    question: 'Why do data visualization experts strongly advise against using 3D Pie Charts in business presentations?',
    codeSnippet: '',
    options: [
      '3D rendering uses too much battery power.',
      '3D perspective distortion skews human visual angle perception, making front slices appear artificially larger than rear slices.',
      '3D charts cannot be printed on paper.',
      'Pie charts can only represent negative numbers.'
    ],
    correctIndex: 1,
    explanation: '3D perspective alters visual proportions; slices tilted toward the foreground look disproportionately larger than equal or bigger slices in the background, misleading viewers.'
  },
  {
    id: 'da-q56',
    track: 'data-analyst',
    skill: 'Business Analytics',
    topic: 'Customer Churn & Retention',
    difficulty: 'Intermediate',
    question: 'How is the Monthly Customer Churn Rate calculated?',
    codeSnippet: `Churn Rate = (Customers Lost during Month) / (Customers at Start of Month) * 100`,
    options: [
      'Total Revenue divided by Total Customers.',
      '(Customers lost during the month / Total customers at start of month) * 100',
      'Total new customers acquired divided by 12.',
      'Total website visits divided by purchases.'
    ],
    correctIndex: 1,
    explanation: 'Churn rate represents the percentage of existing customers who cancel or do not renew their subscriptions during a designated period relative to the cohort size at start.'
  },
  {
    id: 'da-q57',
    track: 'data-analyst',
    skill: 'Business Analytics',
    topic: 'Customer Lifetime Value (CLV)',
    difficulty: 'Intermediate',
    question: 'What is Customer Lifetime Value (CLV / LTV) and why is the LTV to CAC ratio vital for software businesses?',
    codeSnippet: `LTV = (Average Order Value * Purchase Frequency) * Customer Lifespan`,
    options: [
      'LTV measures the total gross margin a customer generates over their entire relationship; an LTV:CAC ratio >= 3:1 indicates healthy, sustainable growth.',
      'LTV is the cost to purchase laptops for staff.',
      'LTV calculates tax deductions on office supplies.',
      'An LTV:CAC ratio of 1:10 is ideal for profitability.'
    ],
    correctIndex: 0,
    explanation: 'CLV estimates total expected economic value from a customer relationship. Comparing it with Customer Acquisition Cost (CAC) ensures customer generation is profitable.'
  },
  {
    id: 'da-q58',
    track: 'data-analyst',
    skill: 'Business Analytics',
    topic: 'Cohort Analysis',
    difficulty: 'Advanced',
    question: 'What is a Cohort Analysis and what primary business insight does it uncover?',
    codeSnippet: '',
    options: [
      'Tracks groups of users who share a common characteristic or sign-up timeframe over time, revealing retention patterns and product health across customer life cycles.',
      'Calculates year-end corporate tax liabilities.',
      'Measures internet bandwidth consumption by employees.',
      'Compares competitors\' stock prices.'
    ],
    correctIndex: 0,
    explanation: 'Cohort analysis groups customers by acquisition period (e.g. March 2026 cohort) and monitors their behavior over successive months to observe true retention trends.'
  },
  {
    id: 'da-q59',
    track: 'data-analyst',
    skill: 'Data Visualization',
    topic: 'Scatter Plots & Trendlines',
    difficulty: 'Beginner',
    question: 'When should a Data Analyst choose a Scatter Plot over a Bar Chart?',
    codeSnippet: '',
    options: [
      'When displaying categorical counts of sales regions.',
      'When investigating the relationship, correlation, or clustering pattern between two continuous numerical variables (e.g. Advertising Spend vs Revenue).',
      'When presenting a single KPI percentage.',
      'When showing a step-by-step financial balance sheet.'
    ],
    correctIndex: 1,
    explanation: 'Scatter plots map individual observations across two continuous axes (X and Y), illuminating correlation patterns, non-linear trends, and clusters.'
  },
  {
    id: 'da-q60',
    track: 'data-analyst',
    skill: 'Business Analytics',
    topic: 'Conversion Funnel Analysis',
    difficulty: 'Intermediate',
    question: 'What is the purpose of a Conversion Funnel in product analytics?',
    codeSnippet: `Impression -> Click -> Add to Cart -> Checkout -> Purchase`,
    options: [
      'Measures drop-off and completion rates across discrete sequential milestones in a user journey to pinpoint UX bottlenecks and optimization opportunities.',
      'Filters spam emails from reaching the sales inbox.',
      'Transfers database files from MySQL to MongoDB.',
      'Encrypts credit card transactions.'
    ],
    correctIndex: 0,
    explanation: 'Funnel visualization illustrates progression rates through a multi-step user flow, exposing where the highest percentage of users drop off to guide product fixes.'
  }
];

export default dataAnalystQuestions;
