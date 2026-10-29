// Challenge 6 – four-bar linkage: theory, FAQ, interview units, parts (plain language)
(function () { const it = window.MF_IT;
window.MF_C2 = { uk: 'mf_units_c6', qk: 'mf_quiz_c6',
 th: [
  ['מה זה מנגנון ארבעה מוטות', 'What a four-bar linkage is', '{fourbar|מנגנון ארבעה מוטות} הוא ארבעה מוטות שמחוברים זה לזה בצירים, כמו שרשרת סגורה. אחד מהם קבוע במקום – המסגרת. כשמזיזים מוט אחד, כל השאר זזים יחד בצורה קבועה ומדויקת.', 'A {fourbar|four-bar linkage} is four bars joined by pins in a closed loop. One of them is fixed – the frame. Move one bar and all the others move with it in a fixed, exact way.'],
  ['שמות המוטות', 'Naming the bars', 'ה{crank|ארכובה} היא המוט הקצר שהמנוע מסובב סיבוב שלם. ה{rocker|מתנדנד} הוא המוט שרק מתנדנד הלוך וחזור. ה{coupler|מוט המחבר} מחבר ביניהם. המוט הרביעי הוא המסגרת – המרחק הקבוע בין שני הצירים.', 'The {crank|crank} is the short bar the motor turns a full circle. The {rocker|rocker} only swings back and forth. The {coupler|coupler} links them. The fourth bar is the frame – the fixed distance between the two pivots.'],
  ['למה לא משולש', 'Why not a triangle', 'שלושה מוטות בצורת משולש לא זזים בכלל – משולש הוא הצורה הקשיחה ביותר, ולכן בונים ממנו גשרים. ארבעה מוטות כבר יכולים לזוז, ולכן הם המנגנון הפשוט ביותר שמעביר תנועה.', 'Three bars in a triangle cannot move at all – the triangle is the stiffest shape, which is why bridges use it. Four bars can move, so they are the simplest linkage that passes on motion.'],
  ['כלל גרסהוף', 'The Grashof rule', 'איך יודעים אם הארכובה תסתובב סיבוב שלם? לוקחים את המוט הקצר ביותר ואת הארוך ביותר ומחברים. אם יוצא פחות מהשניים האחרים יחד – המוט הקצר יכול להסתובב סביב-סביב. אם יוצא יותר – הוא נתקע. זה {grashof|כלל גרסהוף}.', 'How do you know if the crank can turn fully? Add the shortest and the longest bar. If that is less than the other two together, the short bar can spin all the way round. If it is more, it jams. That is the {grashof|Grashof rule}.'],
  ['דוגמה מהמשחק', 'An example from the game', 'במגב: מסגרת 4, מוט מחבר 4, מתנדנד 2. עם ארכובה 1: הקצר 1 והארוך 4 = 5, השניים האחרים 4 ו-2 = 6. 5 פחות מ-6, אז הארכובה מסתובבת. עם ארכובה 3: הקצר 2 והארוך 4 = 6, האחרים 3 ו-4 = 7 – אבל עכשיו המתנדנד הוא הקצר, לא הארכובה, ולכן הארכובה נתקעת.', 'In the wiper: frame 4, coupler 4, rocker 2. With crank 1: shortest 1 + longest 4 = 5; the other two, 4 + 2 = 6. 5 is less than 6, so the crank spins. With crank 3: shortest 2 + longest 4 = 6, others 3 + 4 = 7 – but now the rocker is the shortest, not the crank, so the crank jams.'],
  ['נקודת מעבר', 'The change point', 'כשהקצר והארוך יחד שווים בדיוק לשני האחרים, יש רגע שכל המוטות נמצאים בקו ישר אחד. ברגע הזה המנגנון "לא יודע" לאיזה צד להמשיך, והמגב יכול להתהפך. לכן נמנעים מזה.', 'When shortest plus longest exactly equal the other two, there is a moment when all bars lie in one straight line. Then the linkage "does not know" which way to go and the wiper can flip. So engineers avoid it.'],
  ['כמה המגב זז', 'How far the wiper swings', 'ככל שהארכובה ארוכה יותר, המתנדנד זז יותר רחוק לכל צד. ארכובה 0.5 נותנת רק 30 מעלות – פס צר. ארכובה 1.4 נותנת בערך 90 מעלות – כמעט כל השמשה.', 'The longer the crank, the further the rocker swings each way. Crank 0.5 gives only 30° – a thin strip. Crank 1.4 gives about 90° – nearly the whole windshield.'],
  ['איפה עוד יש', 'Where else it is used', 'מנגנון ארבעה מוטות יש במגבים, בגלגלים של רכבת קיטור, באופניים (הרגל, הדוושה והמסגרת), בציר של דלת ארון שנפתחת למעלה, ובמכונת שאיבת נפט שמהנהנת בשדה.', 'Four-bar linkages are in wipers, steam-train wheels, cycling (leg, pedal and frame), lift-up cupboard hinges, and the nodding oil pumps in fields.']
 ],
 iv: [], qz: [],
 faqC: { what: ['מה זה', 'What it is'], rule: ['הכלל', 'The rule'], wiper: ['המגב', 'The wiper'], game: ['המשחק', 'The game'] },
 faq: [
  ['what', 'למה דווקא ארבעה?', 'Why exactly four?', 'שלושה לא זזים (משולש). חמישה זזים בכמה דרכים ולא יודעים איך. ארבעה זזים בדרך אחת בדיוק – מושלם למכונה.', 'Three cannot move (triangle). Five can move in many ways at once. Four move in exactly one way – perfect for a machine.'],
  ['what', 'מה ההבדל בין ארכובה למתנדנד?', 'Crank vs rocker?', 'ה{crank|ארכובה} מסתובבת סיבוב שלם. ה{rocker|מתנדנד} רק הולך וחוזר.', 'The {crank|crank} turns fully. The {rocker|rocker} only goes back and forth.'],
  ['what', 'מה מחזיק את המוטות יחד?', 'What holds the bars together?', 'צירים קטנים (פינים) בכל חיבור, שמאפשרים למוטות להסתובב זה סביב זה.', 'Small pins at every joint let the bars turn around each other.'],
  ['rule', 'מי זה גרסהוף?', 'Who was Grashof?', 'מהנדס גרמני שחי לפני כ-150 שנה וניסח את הכלל הפשוט הזה.', 'A German engineer who lived about 150 years ago and wrote this simple rule.'],
  ['rule', 'מה אם יותר מהשניים האחרים?', 'What if it is more than the other two?', 'אף מוט לא יכול להסתובב סיבוב שלם. המנגנון רק מתנדנד בשני הצדדים.', 'No bar can turn fully. The linkage only rocks on both sides.'],
  ['rule', 'האם הכלל עובד תמיד?', 'Does the rule always work?', 'כן, לכל מנגנון ארבעה מוטות במישור. צריך רק לבדוק גם איזה מוט הוא הקצר.', 'Yes, for every flat four-bar linkage. Just also check which bar is the shortest.'],
  ['wiper', 'למה לא מנוע שמסתובב הלוך וחזור?', 'Why not a motor that reverses?', 'להפוך כיוון מנוע כל שנייה זה בזבוז ושוחק אותו. קל יותר לסובב תמיד ולתת למוטות להפוך את התנועה.', 'Reversing a motor every second wastes energy and wears it. It is easier to spin one way and let the bars do the reversing.'],
  ['wiper', 'איך מגב שני זז בדיוק כמו הראשון?', 'How does a second wiper copy the first?', 'מוט נוסף מחבר את שני המגבים. הוא יוצר עוד מנגנון ארבעה מוטות, מקביל, ששומר אותם באותה זווית.', 'An extra bar links both wipers, forming another, parallel four-bar that keeps them at the same angle.'],
  ['game', 'איך מקבלים 3 כוכבים?', 'How do I get 3 stars?', 'ארכובה 1.4 ומגב שני מחובר.', 'Crank 1.4 and a linked second wiper.'],
  ['game', 'למה המסגרת שקופה?', 'Why is the frame see-through?', 'כדי לראות את המוטות שמתחת לשמשה. היא נהיית שקופה לבד כשמוסיפים אותם.', 'To see the bars under the glass. It turns see-through by itself when you add them.']
 ],
 units: [
  { he: 'ארבעה מוטות (Four Bars)', en: 'Four bars', items: [
   it('מה עושה מנגנון ארבעה מוטות במגב?', 'What does the four-bar do in a wiper?', 'הופך סיבוב לתנודה.', 'Turns spinning into swinging.', ['הופך סיבוב לתנודה', 'מגביל את הכוח של המנוע', 'מנקה את המים לבד'], ['Turns spin into swing', 'Limits the motor force', 'Cleans water by itself']),
   it('כמה מוטות זזים?', 'How many bars move?', 'שלושה – הרביעי קבוע.', 'Three – the fourth is fixed.', ['שלושה', 'ארבעה', 'אחד'], ['Three', 'Four', 'One']),
   it('מה המוט הקבוע?', 'Which bar is fixed?', 'המסגרת.', 'The frame.', ['המסגרת', 'הארכובה', 'המגב'], ['The frame', 'The crank', 'The wiper']),
   it('מה מחבר בין המוטות?', 'What joins the bars?', 'צירים קטנים.', 'Small pins.', ['צירים קטנים', 'דבק חזק במיוחד לברזל', 'מגנטים'], ['Small pins', 'Strong glue', 'Magnets']),
   it('למה משולש לא זז?', 'Why can a triangle not move?', 'זו צורה קשיחה.', 'It is a rigid shape.', ['צורה קשיחה', 'הוא קטן מדי', 'אין לו מנוע'], ['A rigid shape', 'Too small', 'No motor']),
   it('למה לא חבל?', 'Why not a rope?', 'חבל לא יכול לדחוף.', 'A rope cannot push.', ['לא יכול לדחוף', 'הוא כבד מדי לשמשה', 'הוא יקר מאוד'], ['Cannot push', 'Too heavy for the glass', 'Very expensive']),
   it('למה לא גומייה?', 'Why not a rubber band?', 'נמתחת והמגב מקפץ.', 'It stretches and the wiper bounces.', ['נמתחת ומקפצת', 'חזקה מדי למגב', 'לא נמתחת בכלל'], ['Stretches and bounces', 'Too strong for a wiper', 'Does not stretch']),
   it('איפה עוד יש ארבעה מוטות?', 'Where else is a four-bar?', 'במשאבת נפט מהנהנת.', 'A nodding oil pump.', ['משאבת נפט', 'כוס תה עם כפית', 'ספר'], ['An oil pump', 'A cup of tea', 'A book']),
   it('כמה דרכים לזוז יש לארבעה מוטות?', 'How many ways can four bars move?', 'דרך אחת בדיוק.', 'Exactly one way.', ['דרך אחת', 'אף דרך', 'אינסוף דרכים'], ['One way', 'No way', 'Endless ways']),
   it('ומה עם חמישה מוטות?', 'And five bars?', 'זזים ביותר מדרך אחת.', 'They move in more than one way.', ['יותר מדרך אחת', 'לא זזים בכלל', 'כמו ארבעה'], ['More than one way', 'Not at all', 'Like four'])]},
  { he: 'ארכובה ומתנדנד (Crank & Rocker)', en: 'Crank & rocker', items: [
   it('מה זו ארכובה (Crank)?', 'What is a crank?', 'מוט שמסתובב סיבוב שלם.', 'A bar that turns a full circle.', ['מסתובב סיבוב שלם', 'מתנדנד הלוך וחזור', 'לא זז בכלל'], ['Turns fully', 'Swings back and forth', 'Never moves']),
   it('מה זה מתנדנד (Rocker)?', 'What is a rocker?', 'מוט שזז הלוך וחזור.', 'A bar that swings back and forth.', ['זז הלוך וחזור', 'מסתובב סביב-סביב', 'קבוע במקום'], ['Swings back and forth', 'Spins round', 'Fixed in place']),
   it('מה מסובב את הארכובה?', 'What turns the crank?', 'המנוע.', 'The motor.', ['המנוע', 'הנהג עם היד שלו', 'הגשם'], ['The motor', 'The driver', 'The rain']),
   it('למה המגב מחובר למתנדנד?', 'Why is the wiper on the rocker?', 'כי המגב צריך לנוע הלוך וחזור.', 'Because the wiper must go back and forth.', ['צריך הלוך וחזור', 'כי הוא צריך להסתובב סביב-סביב', 'כי הוא קצר'], ['Must go back and forth', 'Must spin', 'Because it is short']),
   it('מה עושה המוט המחבר (Coupler)?', 'What does the coupler do?', 'מעביר תנועה מארכובה למתנדנד.', 'Passes motion from crank to rocker.', ['מעביר תנועה ביניהם', 'עוצר את המנוע', 'מחזיק את השמשה במקום שלה'], ['Passes motion between them', 'Stops the motor', 'Holds the glass']),
   it('המוט הארוך במגב הוא...', 'The long moving bar is...', 'המוט המחבר.', 'The coupler.', ['המוט המחבר', 'הארכובה', 'הצלב עם ארבע הזרועות'], ['The coupler', 'The crank', 'The cross']),
   it('האם המנוע מחליף כיוון?', 'Does the motor reverse?', 'לא, הוא מסתובב תמיד לאותו כיוון.', 'No, it always spins the same way.', ['לא, תמיד אותו כיוון', 'כן, הוא הופך כיוון כל שנייה', 'רק בגשם'], ['No, always the same way', 'Yes, every second', 'Only in rain']),
   it('אורך המתנדנד במשחק?', 'Rocker length in the game?', '2.', '2.', ['2', '4', '9'], ['2', '4', '9']),
   it('מה החלק הראשון שבונים?', 'Which part comes first?', 'המסגרת והשמשה.', 'The frame and glass.', ['המסגרת והשמשה', 'המגב', 'המוט המחבר'], ['Frame and glass', 'The wiper', 'The coupler']),
   it('איזה צבע הארכובה במשחק?', 'Crank colour in the game?', 'כתום.', 'Orange.', ['כתום', 'ירוק', 'כחול'], ['Orange', 'Green', 'Blue'])]},
  { he: 'כלל גרסהוף (Grashof Rule)', en: 'Grashof rule', items: [
   it('מה בודק כלל גרסהוף?', 'What does Grashof check?', 'אם מוט יכול להסתובב סיבוב שלם.', 'Whether a bar can turn fully.', ['אם מוט מסתובב סיבוב שלם', 'כמה כבד המנגנון', 'כמה מהר המנוע'], ['If a bar can turn fully', 'How heavy it is', 'How fast the motor is']),
   it('אילו מוטות מחברים בכלל?', 'Which bars are added?', 'הקצר והארוך.', 'The shortest and the longest.', ['הקצר והארוך', 'שני הארוכים', 'שני הקצרים'], ['Shortest and longest', 'The two longest', 'The two shortest']),
   it('מתי הקצר יסתובב?', 'When will the short bar spin?', 'כשהסכום קטן מהשניים האחרים.', 'When the sum is less than the other two.', ['כשהסכום קטן יותר', 'כשהסכום גדול יותר', 'אף פעם'], ['When the sum is smaller', 'When it is bigger', 'Never']),
   it('ארכובה 1: קצר+ארוך = ?', 'Crank 1: shortest+longest = ?', '5.', '5.', ['5', '7', '9'], ['5', '7', '9']),
   it('ארכובה 1: שני האחרים = ?', 'Crank 1: the other two = ?', '6.', '6.', ['6', '3', '10'], ['6', '3', '10']),
   it('ארכובה 3 – למה נתקעת?', 'Crank 3 – why does it jam?', 'היא כבר לא המוט הקצר ביותר.', 'It is no longer the shortest bar.', ['היא לא הקצרה ביותר', 'המנוע חלש מדי בשביל המגב', 'המגב כבד'], ['It is not the shortest', 'Motor too weak', 'Wiper too heavy']),
   it('מה קורה כשהסכום שווה בדיוק?', 'What if the sum is exactly equal?', 'כל המוטות בשורה והמנגנון עלול להתהפך.', 'All bars line up and it may flip.', ['עלול להתהפך', 'עובד מושלם', 'מסתובב מהר יותר'], ['It may flip', 'Works perfectly', 'Spins faster']),
   it('איזו ארכובה יוצרת נקודת מעבר?', 'Which crank gives a change point?', '2.0.', '2.0.', ['2.0', '1.0', '0.5'], ['2.0', '1.0', '0.5']),
   it('מי ניסח את הכלל?', 'Who wrote the rule?', 'מהנדס גרמני.', 'A German engineer.', ['מהנדס גרמני', 'נהג מרוצים', 'צייר'], ['A German engineer', 'A racing driver', 'A painter']),
   it('האם צריך נוסחה מסובכת?', 'Is a complicated formula needed?', 'לא, רק חיבור והשוואה.', 'No, just adding and comparing.', ['רק חיבור והשוואה', 'כן, נוסחה ארוכה עם הרבה אותיות', 'צריך מחשב'], ['Just add and compare', 'Yes, a long formula', 'A computer is needed'])]},
  { he: 'תנודת המגב (Wiper Sweep)', en: 'Wiper sweep', items: [
   it('מה משנה את רוחב הניקוי?', 'What changes the sweep?', 'אורך הארכובה.', 'The crank length.', ['אורך הארכובה', 'הצבע של להב המגב', 'מהירות הגשם'], ['Crank length', 'Wiper colour', 'Rain speed']),
   it('ארכובה ארוכה יותר נותנת...', 'A longer crank gives...', 'תנודה רחבה יותר.', 'A wider swing.', ['תנודה רחבה יותר', 'תנודה צרה יותר', 'אין שינוי'], ['A wider swing', 'A narrower swing', 'No change']),
   it('כמה מנקה ארכובה 0.5?', 'How far does crank 0.5 sweep?', 'בערך 30 מעלות.', 'About 30°.', ['30°', '90°', '180°'], ['30°', '90°', '180°']),
   it('כמה מנקה ארכובה 1.4?', 'How far does crank 1.4 sweep?', 'בערך 90 מעלות.', 'About 90°.', ['90°', '10°', '300°'], ['90°', '10°', '300°']),
   it('מה הטווח הנדרש במשחק?', 'Required range in the game?', '60 עד 100 מעלות.', '60° to 100°.', ['60–100°', '0–20°', '200–300°'], ['60–100°', '0–20°', '200–300°']),
   it('למה לא יותר מ-100?', 'Why not over 100°?', 'המגב יוצא מהשמשה.', 'The wiper leaves the glass.', ['יוצא מהשמשה', 'זה איטי מדי', 'זה שקט מדי'], ['Leaves the glass', 'Too slow', 'Too quiet']),
   it('איזו ארכובה נותנת כוכב?', 'Which crank earns a star?', '1.4.', '1.4.', ['1.4', '0.5', '3.0'], ['1.4', '0.5', '3.0']),
   it('מהירות 2 משנה את הרוחב?', 'Does speed 2 change the sweep?', 'לא, רק את הקצב.', 'No, only the pace.', ['לא, רק הקצב', 'כן, כפול', 'כן, חצי'], ['No, only the pace', 'Yes, double', 'Yes, half']),
   it('איך רואים את הרוחב במשחק?', 'Where do you see the sweep?', 'בשורת הנתונים ובחלון גרסהוף.', 'In the stats bar and the Grashof panel.', ['בנתונים ובחלון', 'בצבע הרקע', 'אין דרך'], ['Stats and panel', 'Background colour', 'No way']),
   it('ארכובה 0.5 נכשלת כי...', 'Crank 0.5 fails because...', 'היא מנקה פס צר מדי.', 'It cleans too thin a strip.', ['פס צר מדי', 'היא נתקעת', 'היא מתהפכת'], ['Too thin a strip', 'It jams', 'It flips'])]},
  { he: 'מגב כפול ושימושים (Twin Wipers & Uses)', en: 'Twin wipers & uses', items: [
   it('איך מגב שני זז יחד עם הראשון?', 'How does a second wiper follow?', 'מוט נוסף מחבר ביניהם.', 'An extra bar links them.', ['מוט נוסף', 'מנוע שני', 'חבל'], ['An extra bar', 'A second motor', 'A rope']),
   it('המוט הנוסף יוצר...', 'The extra bar forms...', 'עוד מנגנון ארבעה מוטות.', 'Another four-bar.', ['עוד ארבעה מוטות', 'משולש קשיח שלא זז בכלל', 'גלגל שיניים'], ['Another four-bar', 'A rigid triangle', 'A gear']),
   it('למה לא מנוע לכל מגב?', 'Why not a motor per wiper?', 'קשה לתזמן ויקר יותר.', 'Harder to sync and costs more.', ['קשה לתזמן ויקר', 'אין מקום לחוטים', 'זה לא חוקי'], ['Hard to sync, costly', 'No room for wires', 'It is illegal']),
   it('איפה עוד יש ארבעה מוטות באופניים?', 'Four-bar in cycling?', 'הרגל, הדוושה והמסגרת.', 'Leg, pedal and frame.', ['רגל, דוושה ומסגרת', 'הפעמון', 'המושב'], ['Leg, pedal, frame', 'The bell', 'The seat']),
   it('בארון מטבח יש ארבעה מוטות ב...', 'In a kitchen cupboard it is in...', 'ציר של דלת שנפתחת למעלה.', 'A lift-up door hinge.', ['ציר דלת', 'ידית', 'מדף'], ['A door hinge', 'A handle', 'A shelf']),
   it('ברכבת קיטור הארבעה מוטות מחברים...', 'On a steam train they link...', 'את הבוכנה לגלגלים.', 'The piston to the wheels.', ['בוכנה לגלגלים', 'קרון לקרון', 'פעמון לגג'], ['Piston to wheels', 'Car to car', 'Bell to roof']),
   it('מה הבונוס השני?', 'What is the other bonus?', 'מגב שני מחובר.', 'A linked second wiper.', ['מגב שני מחובר', 'ארכובה 3', 'רצועה'], ['Linked second wiper', 'Crank 3', 'A belt']),
   it('למה המסגרת שקופה?', 'Why is the frame see-through?', 'כדי לראות את המוטות.', 'To see the bars.', ['לראות את המוטות', 'כדי שיהיה קל', 'לקישוט'], ['To see the bars', 'To be light', 'For decoration']),
   it('מה צריך כדי לעבור?', 'What do you need to pass?', 'סיבוב מלא וניקוי 60–100.', 'Full turn and a 60–100° sweep.', ['סיבוב מלא וניקוי', 'רק מגב שני', 'רק מנוע חזק'], ['Full turn and sweep', 'Only a 2nd wiper', 'Only a strong motor']),
   it('ארכובה 1.0 עוברת?', 'Does crank 1.0 pass?', 'כן, 62 מעלות.', 'Yes, 62°.', ['כן', 'לא', 'רק בגשם'], ['Yes', 'No', 'Only in rain'])]}
 ]
};
window.MF_PARTS = {
 frame: ['fourbar', 'שמשה ומסגרת (Glass & Frame)', 'Glass & frame', 'השמשה והמסגרת שמחזיקה את הצירים הקבועים.', 'The glass and the frame holding the fixed pivots.', 'מתאים! זה המוט הרביעי – הקבוע.', 'It fits – it is the fourth, fixed bar.', 'בכל רכב.', 'In every car.'],
 motor: ['fourbar', 'מנוע מגבים (Wiper Motor)', 'Wiper motor', 'מנוע חשמלי קטן שמסתובב תמיד לאותו כיוון.', 'A small electric motor that always spins one way.', 'מתאים! הוא נותן את הסיבוב.', 'It fits – it gives the spin.', 'בכל רכב.', 'In every car.'],
 crank: ['fourbar', 'ארכובה (Crank)', 'Crank', 'מוט קצר שהמנוע מסובב.', 'A short bar the motor turns.', 'מתאים! היא מסתובבת סיבוב שלם.', 'It fits – it turns fully.', 'במגבים ובאופניים.', 'In wipers and bikes.'],
 coupler: ['fourbar', 'מוט מחבר (Coupler)', 'Coupler', 'מוט ארוך שמחבר ארכובה למתנדנד.', 'A long bar linking crank and rocker.', 'מתאים! הוא מעביר את התנועה.', 'It fits – it passes the motion.', 'בכל מנגנון ארבעה מוטות.', 'In every four-bar.'],
 rocker: ['fourbar', 'מתנדנד (Rocker)', 'Rocker', 'מוט שזז הלוך וחזור.', 'A bar that swings back and forth.', 'מתאים! עליו יושב המגב.', 'It fits – the wiper sits on it.', 'במגבים ובמשאבות.', 'In wipers and pumps.'],
 wiper: ['fourbar', 'זרוע ולהב (Arm & Blade)', 'Arm & blade', 'זרוע עם להב גומי שמנקה את השמשה.', 'An arm with a rubber blade that cleans the glass.', 'מתאים! הוא מנקה.', 'It fits – it does the cleaning.', 'בכל רכב.', 'In every car.'],
 triangle: ['fourbar', 'משולש קשיח (Rigid Triangle)', 'Rigid triangle', 'שלושה מוטות בצורת משולש.', 'Three bars in a triangle.', 'לא מתאים: משולש לא זז בכלל.', 'Does not fit: a triangle cannot move.', 'בגשרים ובמגדלים.', 'In bridges and towers.'],
 rope: ['fourbar', 'חבל (Rope)', 'Rope', 'חבל במקום מוט מחבר.', 'A rope instead of a coupler.', 'לא מתאים: חבל לא יכול לדחוף.', 'Does not fit: a rope cannot push.', 'במנופים.', 'In cranes.'],
 band: ['fourbar', 'גומייה (Rubber Band)', 'Rubber band', 'גומייה במקום מוט מחבר.', 'A rubber band instead of a coupler.', 'לא מתאים: נמתחת והמגב מקפץ.', 'Does not fit: it stretches and the wiper bounces.', 'במשרד.', 'In the office.']
};
})();
