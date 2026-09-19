import mysql from 'mysql2/promise';
import crypto from 'crypto';

function uuidv4() {
  return crypto.randomUUID();
}

async function seed() {
  console.log('[Seed] Connecting to Dolt database...');
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'beyon',
  });

  const studentId = '1853170b-89ad-41ec-b73d-14109608e84c';
  const cssSkillId = 'b5b9cb2d-8e6e-491e-8214-ba5b595833c1';
  const htmlSkillId = '5c24265e-a871-458a-aeed-993590e4de99';

  console.log('[Seed] Seeding CSS Boxing (Box Model) questions...');

  const cssBoxingQuestions = [
    {
      title: 'CSS Box Model: Total Rendered Width Calculation',
      description: 'An element has width: 200px, padding: 20px, border: 5px solid, and box-sizing: content-box. What is its total rendered width in the viewport?',
      tags: 'CSS,Frontend,css-boxing,box-model,dimensions',
      difficulty: 'MEDIUM',
      options: [
        { text: '250px', correct: true, explanation: 'Under content-box, total width = width (200px) + left/right padding (40px) + left/right border (10px) = 250px.' },
        { text: '200px', correct: false, explanation: '200px would only be true if box-sizing: border-box was applied.' },
        { text: '225px', correct: false, explanation: 'Padding and borders are applied to both left and right sides.' },
        { text: '240px', correct: false, explanation: 'Must include both padding (40px) and borders (10px).' },
      ],
    },
    {
      title: 'CSS Box Model: Universal border-box Reset',
      description: 'Which CSS property controls whether padding and borders are budgeted within an element declared width and height?',
      tags: 'CSS,Frontend,css-boxing,box-sizing,reset',
      difficulty: 'EASY',
      options: [
        { text: 'box-sizing: border-box;', correct: true, explanation: 'border-box includes padding and border within the declared width and height.' },
        { text: 'box-sizing: content-box;', correct: false, explanation: 'content-box is the default and excludes padding/border from declared dimensions.' },
        { text: 'overflow: clip;', correct: false, explanation: 'overflow controls clipping of overflowing content, not box sizing calculation.' },
        { text: 'display: flow-root;', correct: false, explanation: 'flow-root establishes a block formatting context.' },
      ],
    },
    {
      title: 'CSS Box Model: Vertical Margin Collapsing Mechanics',
      description: 'Under which specific condition does vertical margin collapsing occur between two sibling elements?',
      tags: 'CSS,Frontend,css-boxing,box-model,margin-collapse',
      difficulty: 'MEDIUM',
      options: [
        { text: 'When adjacent in-flow block elements share vertical borders without intervening content, clearance, or padding', correct: true, explanation: 'In normal flow, adjacent vertical margins of block boxes combine into a single margin.' },
        { text: 'When sibling elements are direct flex items inside a display: flex container', correct: false, explanation: 'Margins of flex items never collapse.' },
        { text: 'When sibling elements have display: inline-block applied', correct: false, explanation: 'Inline-block elements establish formatting contexts that prevent margin collapse.' },
        { text: 'When both elements have box-sizing: border-box active', correct: false, explanation: 'box-sizing does not control margin collapsing mechanics.' },
      ],
    },
    {
      title: 'CSS Box Model: Preventing Parent-Child Margin Collapse',
      description: 'How can an engineer prevent vertical margin collapse between a parent block element and its first child element?',
      tags: 'CSS,Frontend,css-boxing,margin-collapse,best-practice',
      difficulty: 'HARD',
      options: [
        { text: 'Add non-zero padding-top, border-top, or overflow: hidden to the parent container', correct: true, explanation: 'A border, padding, or new formatting context on the parent breaks the adjacency required for collapsing.' },
        { text: 'Set box-sizing: content-box on the child element', correct: false, explanation: 'box-sizing does not interrupt parent-child margin collapsing.' },
        { text: 'Set margin: 0 auto on the child element', correct: false, explanation: 'margin: 0 auto centers horizontally and does not alter vertical collapsing.' },
        { text: 'Convert the child element to position: static', correct: false, explanation: 'Elements in normal flow are already position: static by default.' },
      ],
    },
    {
      title: 'CSS Box Model: Default Initial Value of box-sizing',
      description: 'What is the default initial value of the CSS box-sizing property defined by the W3C specification?',
      tags: 'CSS,Frontend,css-boxing,box-model,spec',
      difficulty: 'EASY',
      options: [
        { text: 'content-box', correct: true, explanation: 'W3C CSS specification defaults box-sizing to content-box for backwards compatibility.' },
        { text: 'border-box', correct: false, explanation: 'border-box is popular but is not the CSS specification default.' },
        { text: 'padding-box', correct: false, explanation: 'padding-box was deprecated from CSS specifications.' },
        { text: 'margin-box', correct: false, explanation: 'margin-box is not a valid value for box-sizing.' },
      ],
    },
    {
      title: 'CSS Box Model: Content Area Calculation Under border-box',
      description: 'If an element with box-sizing: border-box has width: 300px, padding: 30px, and border: 2px solid, what is the width of its inner content area?',
      tags: 'CSS,Frontend,css-boxing,box-model,math',
      difficulty: 'MEDIUM',
      options: [
        { text: '236px', correct: true, explanation: 'Content width = 300px - (30px * 2 padding) - (2px * 2 border) = 300 - 60 - 4 = 236px.' },
        { text: '300px', correct: false, explanation: '300px is the total outer box width, not the inner content width.' },
        { text: '240px', correct: false, explanation: 'Borders (4px total) must also be subtracted from the content box.' },
        { text: '266px', correct: false, explanation: 'Padding applies to both left and right (60px total).' },
      ],
    },
    {
      title: 'CSS Box Model: Outline vs Border Geometry',
      description: 'Does the outline property contribute to the calculated box model dimensions or shift surrounding layout elements?',
      tags: 'CSS,Frontend,css-boxing,box-model,outline',
      difficulty: 'MEDIUM',
      options: [
        { text: 'No, outlines are drawn outside the border edge without consuming layout space or altering box dimensions', correct: true, explanation: 'Outlines do not take up space in the document flow and do not expand the box model dimensions.' },
        { text: 'Yes, outlines add thickness directly to the border box calculation', correct: false, explanation: 'Borders take up layout space; outlines do not.' },
        { text: 'Yes, outlines expand the element padding box', correct: false, explanation: 'Outlines are rendered outside borders, never inside padding.' },
        { text: 'Only when box-sizing: content-box is declared', correct: false, explanation: 'Outlines never consume layout space under either box-sizing model.' },
      ],
    },
    {
      title: 'CSS Box Model: Negative Margin Behavior',
      description: 'What happens when a negative margin (e.g. margin-top: -20px) is applied to an in-flow block element?',
      tags: 'CSS,Frontend,css-boxing,box-model,negative-margin',
      difficulty: 'HARD',
      options: [
        { text: 'It pulls the element upward by 20px in the vertical flow, allowing adjacent content to overlap or shift accordingly', correct: true, explanation: 'Negative vertical margins pull the element or subsequent siblings toward the margin direction.' },
        { text: 'It reduces the element inner content width by 20px', correct: false, explanation: 'Negative margins do not alter inner content dimensions.' },
        { text: 'The browser invalidates the rule because negative values are illegal for margins', correct: false, explanation: 'Negative values are fully valid on margin properties.' },
        { text: 'It converts the element to absolute positioning', correct: false, explanation: 'Negative margins do not change positioning schemes.' },
      ],
    },
    {
      title: 'CSS Box Model: Concentric Layer Hierarchy',
      description: 'In CSS Box Model geometry, what is the precise order of layers from the inside out?',
      tags: 'CSS,Frontend,css-boxing,box-model,fundamentals',
      difficulty: 'EASY',
      options: [
        { text: 'Content -> Padding -> Border -> Margin', correct: true, explanation: 'The box model concentric layers from innermost to outermost are Content, Padding, Border, Margin.' },
        { text: 'Content -> Border -> Padding -> Margin', correct: false, explanation: 'Padding sits inside the border, surrounding the content.' },
        { text: 'Margin -> Border -> Padding -> Content', correct: false, explanation: 'This is the outside-in order, not inside-out.' },
        { text: 'Content -> Margin -> Padding -> Border', correct: false, explanation: 'Margin is the outermost layer.' },
      ],
    },
    {
      title: 'CSS Box Model: Collapsed Margin Between Sibling Blocks',
      description: 'When two adjacent block elements have consecutive vertical margins of 30px (bottom) and 20px (top), what is the resulting collapsed vertical margin distance?',
      tags: 'CSS,Frontend,css-boxing,box-model,margin-collapse',
      difficulty: 'MEDIUM',
      options: [
        { text: '30px', correct: true, explanation: 'When both margins are positive, they collapse to the maximum of the two values: max(30px, 20px) = 30px.' },
        { text: '50px', correct: false, explanation: 'Margins collapse rather than adding together.' },
        { text: '10px', correct: false, explanation: 'Positive margins do not subtract.' },
        { text: '25px', correct: false, explanation: 'Margins collapse to the maximum, not the average.' },
      ],
    },
  ];

  const otherCssQuestions = [
    {
      title: 'CSS Flexbox: Primary Axis Alignment',
      description: 'Which CSS property aligns flex items along the primary main axis of a flex container?',
      tags: 'CSS,Frontend,flexbox,layout',
      difficulty: 'EASY',
      options: [
        { text: 'justify-content', correct: true, explanation: 'justify-content aligns items along the main axis.' },
        { text: 'align-items', correct: false, explanation: 'align-items aligns items along the cross axis.' },
        { text: 'align-content', correct: false, explanation: 'align-content aligns multi-line flex tracks along cross axis.' },
        { text: 'flex-direction', correct: false, explanation: 'flex-direction establishes the primary axis direction.' },
      ],
    },
    {
      title: 'CSS Grid: Fractional Unit Distribution',
      description: 'What does the fr unit represent in CSS Grid layout specifications?',
      tags: 'CSS,Frontend,grid,layout',
      difficulty: 'MEDIUM',
      options: [
        { text: 'A fraction of the available free space in the grid container', correct: true, explanation: 'The fr unit represents a fraction of the unused remaining space.' },
        { text: 'A fixed percentage of the viewport width', correct: false, explanation: 'vw represents viewport width percentage, not fr.' },
        { text: 'A relative unit based on root font size', correct: false, explanation: 'rem is based on root font size.' },
        { text: 'The frame rate of CSS transitions', correct: false, explanation: 'fr stands for fraction in CSS grid.' },
      ],
    },
    {
      title: 'CSS Selectors: Specificity Weight Hierarchy',
      description: 'Which selector combination possesses the highest CSS specificity weight?',
      tags: 'CSS,Frontend,selectors,specificity',
      difficulty: 'MEDIUM',
      options: [
        { text: '#nav-main .menu-item:hover', correct: true, explanation: 'Has 1 ID (1,0,0), 1 class (0,1,0), and 1 pseudo-class (0,1,0) = 1,2,0.' },
        { text: 'div.header ul.nav li.item a', correct: false, explanation: 'Has 0 IDs, 3 classes, 3 elements = 0,3,3.' },
        { text: 'section.content h1', correct: false, explanation: 'Has 0 IDs, 1 class, 2 elements = 0,1,2.' },
        { text: '* { color: red; }', correct: false, explanation: 'Universal selector has 0 specificity.' },
      ],
    },
    {
      title: 'CSS Typography: Relative Units rem vs em',
      description: 'What is the fundamental difference between the rem and em units in CSS?',
      tags: 'CSS,Frontend,typography,units',
      difficulty: 'EASY',
      options: [
        { text: 'rem is relative to the root html element font-size, while em is relative to the element immediate parent font-size', correct: true, explanation: 'rem = root em (predictable), while em compounds with parent font sizes.' },
        { text: 'rem is only valid for padding, while em is only for font size', correct: false, explanation: 'Both can be used for any length property.' },
        { text: 'em is relative to the viewport height', correct: false, explanation: 'vh is relative to viewport height.' },
        { text: 'rem changes dynamically based on screen pixel density', correct: false, explanation: 'rem is strictly tied to root element font-size.' },
      ],
    },
    {
      title: 'CSS Flexbox: flex-shrink Factor Behavior',
      description: 'What does flex-shrink: 0 declare on a flex item?',
      tags: 'CSS,Frontend,flexbox,sizing',
      difficulty: 'MEDIUM',
      options: [
        { text: 'The flex item will refuse to shrink below its flex-basis or content size when container space is constrained', correct: true, explanation: 'flex-shrink: 0 locks the item from shrinking.' },
        { text: 'The flex item will shrink at double the rate of siblings', correct: false, explanation: 'flex-shrink: 2 would double shrink rate.' },
        { text: 'The flex item will expand to fill all remaining space', correct: false, explanation: 'flex-grow: 1 fills remaining space.' },
        { text: 'The flex item will hide when overflow occurs', correct: false, explanation: 'overflow controls visibility.' },
      ],
    },
    {
      title: 'CSS Grid: auto-fit vs auto-fill with minmax',
      description: 'When using repeat(auto-fit, minmax(200px, 1fr)), what happens when the container has extra horizontal space?',
      tags: 'CSS,Frontend,grid,responsive',
      difficulty: 'HARD',
      options: [
        { text: 'Empty tracks collapse to 0px, and filled items stretch to consume the full container width', correct: true, explanation: 'auto-fit collapses empty tracks so existing items expand.' },
        { text: 'Empty tracks remain open as empty ghost columns', correct: false, explanation: 'That is the behavior of auto-fill, not auto-fit.' },
        { text: 'Items wrap onto new rows prematurely', correct: false, explanation: 'Items stay on the current row as long as 200px fits.' },
        { text: 'The grid switches automatically to flex-wrap', correct: false, explanation: 'Grid maintains grid display formatting.' },
      ],
    },
    {
      title: 'CSS Selectors: The :is() and :where() Pseudo-Classes',
      description: 'What is the primary operational distinction between :is() and :where() selectors in CSS?',
      tags: 'CSS,Frontend,selectors,modern-css',
      difficulty: 'HARD',
      options: [
        { text: ':where() always has a specificity score of 0, whereas :is() adopts the specificity of its most specific argument', correct: true, explanation: ':where() was explicitly designed for low-specificity CSS utility resets.' },
        { text: ':where() only accepts tag names, while :is() accepts class names', correct: false, explanation: 'Both accept identical selector lists.' },
        { text: ':is() can only be used inside media queries', correct: false, explanation: ':is() can be used anywhere in stylesheets.' },
        { text: ':where() executes asynchronously in browser rendering loops', correct: false, explanation: 'Selectors are evaluated synchronously.' },
      ],
    },
    {
      title: 'CSS Display: inline-block Baseline Alignment',
      description: 'Why do adjacent inline-block elements with different content heights often appear vertically misaligned?',
      tags: 'CSS,Frontend,display,alignment',
      difficulty: 'MEDIUM',
      options: [
        { text: 'inline-block elements align by default to the baseline of their last in-flow line box unless vertical-align: top/middle is set', correct: true, explanation: 'Default vertical-align is baseline, which aligns with font baselines.' },
        { text: 'inline-block elements automatically trigger margin collapse', correct: false, explanation: 'inline-block elements do not collapse vertical margins.' },
        { text: 'inline-block elements reject explicit width definitions', correct: false, explanation: 'inline-block accepts explicit width and height.' },
        { text: 'inline-block creates an isolated rendering iframe', correct: false, explanation: 'inline-block does not create iframes.' },
      ],
    },
  ];

  const htmlQuestions = [
    {
      title: 'Semantic HTML: article vs section Distinction',
      description: 'According to HTML5 living standards, when should <article> be chosen over <section>?',
      tags: 'HTML,Frontend,semantic-html,semantics',
      difficulty: 'MEDIUM',
      options: [
        { text: 'When the content represents a self-contained, independently distributable or reusable composition (e.g. blog post, card, news article)', correct: true, explanation: '<article> denotes an independent unit of content that could be syndicated.' },
        { text: 'When the content requires an accompanying sidebar navigation', correct: false, explanation: '<aside> is used for sidebars.' },
        { text: 'Whenever styling with CSS flexbox is required', correct: false, explanation: 'HTML tags convey semantic meaning, not CSS styling rules.' },
        { text: 'Only when enclosing raw SVG vector graphics', correct: false, explanation: '<svg> encapsulates vector graphics.' },
      ],
    },
    {
      title: 'HTML Accessibility: Accessible Form Label Association',
      description: 'Which technique represents the standard, accessible method to associate a <label> with an <input>?',
      tags: 'HTML,Frontend,forms,accessibility',
      difficulty: 'EASY',
      options: [
        { text: 'Set the label for attribute equal to the unique id attribute of the input element', correct: true, explanation: 'The for attribute pairs screen readers and tap/click focus to input id.' },
        { text: 'Set the label name attribute equal to the input class name', correct: false, explanation: 'for pairs to id, not class.' },
        { text: 'Place the label inside a placeholder attribute', correct: false, explanation: 'placeholders disappear on input and do not replace labels.' },
        { text: 'Wrap both elements in a <span> tag without attributes', correct: false, explanation: 'Requires explicit attribute pairing or wrapping label.' },
      ],
    },
    {
      title: 'Semantic HTML: The main Landmark Element',
      description: 'What is the structural constraint regarding the <main> element in an HTML document?',
      tags: 'HTML,Frontend,semantic-html,landmarks',
      difficulty: 'EASY',
      options: [
        { text: 'There must be only one visible <main> element per document, representing the primary unique content of that page', correct: true, explanation: '<main> represents central topic content not repeated across pages.' },
        { text: 'Every header and footer must reside inside <main>', correct: false, explanation: 'Site headers and footers reside outside <main>.' },
        { text: '<main> is deprecated in favor of <div role="region">', correct: false, explanation: '<main> is modern standard HTML5.' },
        { text: '<main> requires a fixed width of 1200px', correct: false, explanation: 'HTML specifies semantics, not fixed width dimensions.' },
      ],
    },
    {
      title: 'HTML Form Validation: Native Pattern & Inputmode',
      description: 'How can you prompt mobile devices to display an optimized numeric keypad while enforcing digits-only validation?',
      tags: 'HTML,Frontend,forms,validation',
      difficulty: 'MEDIUM',
      options: [
        { text: 'Use inputmode="numeric" with pattern="[0-9]*"', correct: true, explanation: 'inputmode="numeric" triggers numeric virtual keyboard and pattern validates digits.' },
        { text: 'Set type="date" on the input', correct: false, explanation: 'type="date" triggers a date picker UI.' },
        { text: 'Add class="numeric-keypad"', correct: false, explanation: 'Classes do not configure virtual keyboard layouts.' },
        { text: 'Set autocomplete="postal-code" only', correct: false, explanation: 'autocomplete does not ensure numeric keypad.' },
      ],
    },
    {
      title: 'HTML Viewport: Responsive Mobile Meta Tag',
      description: 'What is the purpose of <meta name="viewport" content="width=device-width, initial-scale=1.0"> in HTML?',
      tags: 'HTML,Frontend,viewport,responsive',
      difficulty: 'EASY',
      options: [
        { text: 'It sets the viewport width to match the physical device screen width and establishes a 1:1 initial zoom ratio', correct: true, explanation: 'Prevents mobile browsers from rendering desktop 980px zoom views.' },
        { text: 'It enforces fixed desktop layout rendering on mobile devices', correct: false, explanation: 'It does the opposite by enabling responsive viewport scaling.' },
        { text: 'It compresses image payloads over cellular data connections', correct: false, explanation: 'Viewport meta does not alter image compression.' },
        { text: 'It locks the screen orientation to portrait mode permanently', correct: false, explanation: 'Screen orientation API handles locking, not viewport meta.' },
      ],
    },
    {
      title: 'HTML Security: rel="noopener noreferrer" with target="_blank"',
      description: 'Why should external links with target="_blank" include rel="noopener noreferrer"?',
      tags: 'HTML,Frontend,security,links',
      difficulty: 'HARD',
      options: [
        { text: 'To prevent the opened new tab from accessing the originating window via window.opener and performing reverse tabnabbing attacks', correct: true, explanation: 'noopener ensures window.opener is null, preventing malicious redirection.' },
        { text: 'To force browsers to download links as local files', correct: false, explanation: 'The download attribute handles file downloads.' },
        { text: 'To disable cross-origin CORS headers', correct: false, explanation: 'CORS applies to XMLHttp/fetch requests, not anchor tags.' },
        { text: 'To speed up DNS prefetching on subdomains', correct: false, explanation: 'rel="dns-prefetch" handles DNS resolution.' },
      ],
    },
    {
      title: 'HTML Accessibility: Meaningful Alternative Text on Images',
      description: 'Under accessibility guidelines (WCAG), what should the alt attribute contain for a purely decorative image?',
      tags: 'HTML,Frontend,accessibility,wcag',
      difficulty: 'EASY',
      options: [
        { text: 'alt="" (an empty string so assistive technologies safely bypass the decorative graphic)', correct: true, explanation: 'Empty alt="" informs screen readers to skip decorative images.' },
        { text: 'alt="decorative image"', correct: false, explanation: 'Announces redundant auditory clutter to screen reader users.' },
        { text: 'Omit the alt attribute entirely', correct: false, explanation: 'Omitting alt causes screen readers to read the raw image URL filename.' },
        { text: 'alt="null"', correct: false, explanation: 'Screen readers will literally announce the word null.' },
      ],
    },
    {
      title: 'HTML Semantic Structure: The aside Element',
      description: 'Which content is semantically appropriate to place inside an <aside> element?',
      tags: 'HTML,Frontend,semantic-html,layout',
      difficulty: 'EASY',
      options: [
        { text: 'Content tangentially related to the main content, such as sidebars, related article links, callouts, or advertising', correct: true, explanation: '<aside> is semantically designed for secondary or tangential content.' },
        { text: 'The primary headline and opening paragraph of a news story', correct: false, explanation: 'Main article content belongs in <article> or <main>.' },
        { text: 'The mandatory global navigation header of the entire portal', correct: false, explanation: 'Global navigation belongs in <header> and <nav>.' },
        { text: 'A data table comparing product specifications', correct: false, explanation: 'Tables belong in <table> within the main section.' },
      ],
    },
  ];

  // Helper to insert questions and options
  async function insertQuestions(questionsList: any[], skillId: string) {
    const insertedIds: string[] = [];
    for (const q of questionsList) {
      const qId = uuidv4();
      await conn.execute(
        `INSERT INTO questions (id, skill_id, title, description, question_type, difficulty, evaluation_method, tags, status, version, created_at, updated_at)
         VALUES (?, ?, ?, ?, 'MCQ', ?, 'EXACT_MATCH', ?, 'PUBLISHED', 1, NOW(), NOW())`,
        [qId, skillId, q.title, q.description, q.difficulty, q.tags]
      );

      let order = 1;
      for (const opt of q.options) {
        const optId = uuidv4();
        await conn.execute(
          `INSERT INTO question_options (id, question_id, option_text, is_correct, display_order, explanation, created_at)
           VALUES (?, ?, ?, ?, ?, ?, NOW())`,
          [optId, qId, opt.text, opt.correct ? 1 : 0, order++, opt.explanation || '']
        );
      }
      insertedIds.push(qId);
    }
    return insertedIds;
  }

  const seededBoxingIds = await insertQuestions(cssBoxingQuestions, cssSkillId);
  const seededOtherCssIds = await insertQuestions(otherCssQuestions, cssSkillId);
  const seededHtmlIds = await insertQuestions(htmlQuestions, htmlSkillId);

  console.log(`[Seed] Inserted ${seededBoxingIds.length} CSS Boxing questions.`);
  console.log(`[Seed] Inserted ${seededOtherCssIds.length} Other CSS questions.`);
  console.log(`[Seed] Inserted ${seededHtmlIds.length} HTML questions.`);

  console.log('[Seed] Seeding realistic student attempts to establish CSS Boxing weakness (20% accuracy)...');

  // Seed CSS Boxing attempts: 5 attempts, only 1 correct (20% accuracy)
  for (let i = 0; i < 5; i++) {
    const qId = seededBoxingIds[i];
    const isCorrect = i === 0 ? 1 : 0; // Only first one correct
    await conn.execute(
      `INSERT INTO student_question_attempts (id, student_id, question_id, attempt_number, user_answer, is_correct, time_spent_seconds, score, feedback, status, created_at)
       VALUES (?, ?, ?, 1, 'Sample student answer', ?, 35, ?, ?, 'SUBMITTED', NOW())`,
      [uuidv4(), studentId, qId, isCorrect, isCorrect ? '1.00' : '0.00', isCorrect ? 'Correct!' : 'Incorrect. Review box-sizing calculation.']
    );
  }

  // Seed Other CSS attempts: 4 attempts, 3 correct (75% accuracy)
  for (let i = 0; i < 4; i++) {
    const qId = seededOtherCssIds[i];
    const isCorrect = i < 3 ? 1 : 0;
    await conn.execute(
      `INSERT INTO student_question_attempts (id, student_id, question_id, attempt_number, user_answer, is_correct, time_spent_seconds, score, feedback, status, created_at)
       VALUES (?, ?, ?, 1, 'Sample student answer', ?, 25, ?, ?, 'SUBMITTED', NOW())`,
      [uuidv4(), studentId, qId, isCorrect, isCorrect ? '1.00' : '0.00', isCorrect ? 'Correct!' : 'Incorrect.']
    );
  }

  // Seed HTML attempts: 5 attempts, 4 correct (80% accuracy)
  for (let i = 0; i < 5; i++) {
    const qId = seededHtmlIds[i];
    const isCorrect = i < 4 ? 1 : 0;
    await conn.execute(
      `INSERT INTO student_question_attempts (id, student_id, question_id, attempt_number, user_answer, is_correct, time_spent_seconds, score, feedback, status, created_at)
       VALUES (?, ?, ?, 1, 'Sample student answer', ?, 20, ?, ?, 'SUBMITTED', NOW())`,
      [uuidv4(), studentId, qId, isCorrect, isCorrect ? '1.00' : '0.00', isCorrect ? 'Correct!' : 'Incorrect.']
    );
  }

  // Update student_skills record
  await conn.execute(
    `UPDATE student_skills SET score = 20.00, questions_tested = 9, questions_correct = 4, updated_at = NOW()
     WHERE user_id = ? AND skill_name = 'CSS'`,
    [studentId]
  );

  await conn.execute(
    `UPDATE student_skills SET score = 80.00, questions_tested = 5, questions_correct = 4, updated_at = NOW()
     WHERE user_id = ? AND skill_name = 'HTML'`,
    [studentId]
  );

  console.log('[Seed] Student attempts and skill scores successfully seeded!');
  await conn.end();
}

seed().catch(err => {
  console.error('[Seed Error]:', err);
  process.exit(1);
});
