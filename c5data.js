// Challenge 5 – camshaft: theory, FAQ, interview units, parts (plain language)
(function () { const it = window.MF_IT;
window.MF_C2 = { uk: 'mf_units_c5', qk: 'mf_quiz_c5',
 th: [
  ['מה זה גל זיזים', 'What a camshaft is', '{camshaft|גל זיזים} הוא ציר ארוך עם בליטות בצורת ביצה – {lobe|זיזים}. כשהציר מסתובב, החלק הבולט של כל זיז דוחף משהו למטה, ואז משחרר אותו. כך הופכים סיבוב לתנועה של למעלה-למטה.', 'A {camshaft|camshaft} is a long shaft with egg-shaped bumps – {lobe|lobes}. As it turns, each lobe\'s tip pushes something down, then lets it go. That turns spinning into up-and-down motion.'],
  ['מה הוא פותח', 'What it opens', 'במנוע יש {valve|שסתומים} – פקקים שפותחים את הדרך לאוויר שנכנס ולגז השרוף שיוצא. גל הזיזים פותח כל שסתום בדיוק בזמן הנכון, כשהבוכנה צריכה אוויר.', 'An engine has {valve|valves} – plugs that open the way for fresh air in and burnt gas out. The camshaft opens each valve at exactly the right moment, when the piston needs air.'],
  ['העוקב', 'The follower', 'בין הזיז לשסתום יושב {follower|עוקב} – כוס קטנה וחלקה. הזיז מחליק עליה ודוחף אותה, והיא דוחפת את השסתום. כך הזיז לא שוחק את השסתום ישירות.', 'Between lobe and valve sits a {follower|follower} – a small smooth cup. The lobe slides on it and pushes it, and it pushes the valve. So the lobe does not rub the valve directly.'],
  ['הקפיץ מחזיר', 'The spring brings it back', 'הזיז רק דוחף – הוא לא יכול למשוך. את השסתום מחזיר למקום {spring|קפיץ} חזק. הקפיץ גם לוחץ את העוקב אל הזיז כל הזמן כדי שלא יאבד מגע.', 'The lobe can only push – it cannot pull. A strong {spring|spring} brings the valve back. It also keeps the follower pressed on the lobe so it never loses touch.'],
  ['ריחוף שסתומים', 'Valve float', 'ככל שהמנוע מהיר יותר, יש פחות זמן לקפיץ להחזיר את השסתום. אם הקפיץ חלש, השסתום "נזרק" מהזיז ומרחף – הוא נשאר פתוח מדי ומקפץ. המנוע מאבד כוח, ובמקרה גרוע השסתום פוגע בבוכנה.', 'The faster the engine, the less time the spring has to close the valve. With a weak spring the valve is thrown off the lobe and floats – it stays open too long and bounces. The engine loses power, and at worst the valve hits the piston.'],
  ['אז קפיץ הכי חזק?', 'So the stiffest spring?', 'לא. קפיץ קשה מדי לוחץ את העוקב חזק מאוד על הזיז. זה שוחק את שניהם ומבזבז כוח על חיכוך. בוחרים את הקפיץ החלש ביותר שעדיין לא מרחף בסל״ד המקסימלי. במשחק: 3.', 'No. A too-stiff spring presses the follower very hard on the lobe. That wears both and wastes power on friction. Pick the softest spring that still does not float at top revs. In the game: 3.'],
  ['זיז הרמה גבוהה', 'High-lift lobes', 'זיז עם בליטה גבוהה יותר פותח את השסתום יותר, נכנס יותר אוויר והמנוע חזק יותר. אבל השסתום זז מרחק גדול יותר באותו זמן, אז קל יותר שירחף – צריך קפיץ מעט חזק יותר.', 'A taller lobe opens the valve further, more air flows and the engine gets stronger. But the valve travels further in the same time, so it floats more easily – it needs a slightly stronger spring.'],
  ['הרצועה המשוננת', 'The toothed belt', 'גל הזיזים מסתובב פעם אחת על כל שני סיבובים של גל הארכובה, ולכן הגלגל שלו גדול פי 2. הרצועה חייבת להיות משוננת: אם היא מחליקה אפילו קצת, השסתומים נפתחים בזמן הלא נכון.', 'The camshaft turns once for every two turns of the crankshaft, so its pulley is twice as big. The belt must be toothed: if it slips even a bit, the valves open at the wrong moment.']
 ],
 iv: [], qz: [],
 faqC: { what: ['מה זה', 'What it is'], float: ['ריחוף', 'Float'], tune: ['כיוון', 'Tuning'], game: ['המשחק', 'The game'] },
 faq: [
  ['what', 'למה הזיז בצורת ביצה?', 'Why is a lobe egg-shaped?', 'החלק העגול לא דוחף – השסתום סגור. החלק הבולט דוחף בהדרגה – השסתום נפתח ונסגר בעדינות.', 'The round part does not push – the valve is shut. The tip pushes gradually – the valve opens and closes smoothly.'],
  ['what', 'כמה שסתומים יש למנוע?', 'How many valves does an engine have?', 'לפחות שניים לכל צילינדר: אחד לאוויר שנכנס ואחד לגז שיוצא. הרבה מנועים היום עם ארבעה.', 'At least two per cylinder: one for air in and one for gas out. Many engines today have four.'],
  ['what', 'למה זה נקרא "ראש" מנוע?', 'Why is it called the "head"?', 'זה החלק העליון של המנוע, שיושב מעל הצילינדרים כמו כובע.', 'It is the top part of the engine, sitting on the cylinders like a cap.'],
  ['float', 'איך שומעים ריחוף?', 'What does float sound like?', 'המנוע מפסיק למשוך בסל״ד גבוה, ולפעמים יש נקישות מתכתיות.', 'The engine stops pulling at high revs, and sometimes there is a metallic clatter.'],
  ['float', 'למה ריחוף מסוכן?', 'Why is float dangerous?', 'שסתום שנשאר פתוח יכול להיפגש עם הבוכנה שעולה. זה מכופף את השסתום ויכול להרוס את המנוע.', 'A valve left open can meet the rising piston. That bends the valve and can wreck the engine.'],
  ['float', 'מה הגבול בסל״ד?', 'What limits the revs?', 'במכונית יש מחשב שלא נותן לעבור את הסל״ד המקסימלי, בדיוק כדי למנוע ריחוף.', 'Cars have a computer that will not let you pass top revs, exactly to prevent float.'],
  ['tune', 'למה לא קפיץ 5?', 'Why not spring 5?', 'הוא לא מרחף, אבל הוא לוחץ חזק מדי – הזיזים נשחקים והמנוע מבזבז כוח.', 'It does not float, but it presses too hard – lobes wear and power is wasted.'],
  ['tune', 'למה לא רצועה רגילה?', 'Why not a plain belt?', 'רצועה חלקה מחליקה, ואז הזמנים של השסתומים זזים. משוננת אף פעם לא מחליקה.', 'A smooth belt slips and the valve timing drifts. A toothed one never slips.'],
  ['game', 'איך מקבלים 3 כוכבים?', 'How do I get 3 stars?', 'קפיץ 3 עם זיז הרמה גבוהה. זה עדיין לא מרחף ב-6,500.', 'Spring 3 with high-lift lobes. It still does not float at 6,500.'],
  ['game', 'למה הראש שקוף?', 'Why is the head see-through?', 'כדי לראות את העוקבים, השסתומים והקפיצים זזים. כשהם נוספים הוא נהיה שקוף לבד.', 'To watch the followers, valves and springs move. It turns see-through by itself when they are added.']
 ],
 units: [
  { he: 'מה זה גל זיזים (Camshaft)', en: 'What a camshaft is', items: [
   it('מה עושה גל זיזים?', 'What does a camshaft do?', 'הופך סיבוב לתנועה למעלה-למטה.', 'Turns spinning into up-and-down motion.', ['הופך סיבוב לתנועה למעלה-למטה', 'מגביל את מהירות המנוע', 'מטעין את המצבר בזמן הנסיעה'], ['Turns spin into up-down motion', 'Limits engine speed', 'Charges the battery']),
   it('מה זה זיז (Lobe)?', 'What is a lobe?', 'בליטה בצורת ביצה על הציר.', 'An egg-shaped bump on the shaft.', ['בליטה בצורת ביצה', 'קפיץ קטן על הציר', 'חור בראש המנוע'], ['An egg-shaped bump', 'A small spring', 'A hole in the head']),
   it('מה פותח גל הזיזים?', 'What does the camshaft open?', 'את השסתומים.', 'The valves.', ['שסתומים', 'דלתות של תא המנוע', 'חלונות'], ['Valves', 'Doors', 'Windows']),
   it('למה צריך שסתומים?', 'Why are valves needed?', 'כדי להכניס אוויר ולהוציא גז שרוף.', 'To let air in and burnt gas out.', ['אוויר נכנס, גז יוצא', 'כדי לקרר את המים במצנן', 'כדי לשמן את המנוע'], ['Air in, gas out', 'To cool the water', 'To oil the engine']),
   it('האם דיסק עגול יכול לשמש זיז?', 'Can a round disc be a lobe?', 'לא – הוא לא דוחף כלום.', 'No – it pushes nothing.', ['לא, הוא לא דוחף', 'כן, הוא עובד טוב יותר', 'כן, רק בסרק'], ['No, it pushes nothing', 'Yes, it works better', 'Yes, at idle only']),
   it('איפה יושב גל הזיזים?', 'Where does the camshaft sit?', 'בראש המנוע, מעל השסתומים.', 'In the head, above the valves.', ['בראש המנוע', 'בתוך הגלגל', 'מתחת למושב'], ['In the head', 'In the wheel', 'Under the seat']),
   it('כמה זיזים יש לכל שסתום?', 'How many lobes per valve?', 'אחד.', 'One.', ['אחד', 'שלושה', 'עשרה'], ['One', 'Three', 'Ten']),
   it('למה הזיזים מסובבים זה מזה?', 'Why are the lobes turned from each other?', 'כל צילינדר צריך אוויר בזמן אחר.', 'Each cylinder needs air at a different time.', ['כל צילינדר בזמן אחר', 'כדי שיהיה יפה', 'כדי שהציר יהיה קל יותר'], ['Each cylinder at its own time', 'For looks', 'To be light']),
   it('האם הזיז יכול למשוך את השסתום?', 'Can the lobe pull the valve?', 'לא, הוא רק דוחף.', 'No, it only pushes.', ['לא, רק דוחף', 'כן, בכל סיבוב', 'רק בסל״ד גבוה'], ['No, only pushes', 'Yes, every turn', 'Only at high revs']),
   it('בעוד איזה מכשיר יש זיז?', 'What else uses a cam?', 'מכונת תפירה.', 'A sewing machine.', ['מכונת תפירה', 'כוס קפה רגילה מזכוכית', 'ספר'], ['A sewing machine', 'A coffee cup', 'A book'])]},
  { he: 'עוקבים ושסתומים (Followers & Valves)', en: 'Followers & valves', items: [
   it('מה זה עוקב (Follower)?', 'What is a follower?', 'כוס שיושבת על הזיז ועולה ויורדת איתו.', 'A cup riding the lobe, rising and falling with it.', ['כוס שעולה ויורדת', 'רצועה שמסובבת', 'מסנן אוויר מעל המנוע'], ['A cup that rises and falls', 'A belt that turns', 'An air filter']),
   it('למה צריך עוקב?', 'Why have a follower?', 'כדי שהזיז לא ישחק את השסתום ישירות.', 'So the lobe does not rub the valve directly.', ['מגן על השסתום מחיכוך', 'מאיץ את המנוע', 'מחליף את הקפיץ כשהוא נשבר'], ['Shields the valve from rubbing', 'Speeds the engine', 'Replaces the spring']),
   it('איך נראה שסתום?', 'What does a valve look like?', 'כמו פטרייה עם רגל ארוכה.', 'Like a mushroom with a long stem.', ['כמו פטרייה', 'כמו כדור', 'כמו קובייה'], ['Like a mushroom', 'Like a ball', 'Like a cube']),
   it('כמה שסתומים לפחות לצילינדר?', 'At least how many valves per cylinder?', 'שניים.', 'Two.', ['שניים', 'אחד', 'שמונה'], ['Two', 'One', 'Eight']),
   it('מתי השסתום פתוח?', 'When is the valve open?', 'כשהחלק הבולט של הזיז דוחף.', 'When the lobe\'s tip pushes.', ['כשקצה הזיז דוחף', 'כל הזמן', 'אף פעם'], ['When the tip pushes', 'All the time', 'Never']),
   it('מה קורה בחלק העגול של הזיז?', 'On the lobe\'s round part?', 'השסתום סגור.', 'The valve is shut.', ['השסתום סגור', 'השסתום פתוח עד הסוף', 'השסתום נשבר'], ['Valve shut', 'Valve fully open', 'Valve breaks']),
   it('ממה עשוי העוקב?', 'What is a follower made of?', 'מתכת קשה וחלקה.', 'Hard smooth metal.', ['מתכת קשה וחלקה', 'גומי רך', 'פלסטיק דק'], ['Hard smooth metal', 'Soft rubber', 'Thin plastic']),
   it('מה מקבל העוקב מהזיז?', 'What does the follower get from the lobe?', 'דחיפה למטה.', 'A push down.', ['דחיפה', 'חשמל', 'שמן קר'], ['A push', 'Electricity', 'Cold oil']),
   it('מה צריך להיות בין זיז לעוקב?', 'What goes between lobe and follower?', 'שמן.', 'Oil.', ['שמן', 'מים', 'חול'], ['Oil', 'Water', 'Sand']),
   it('במשחק, איזה צבע העוקבים?', 'In the game, what colour are the followers?', 'כתום.', 'Orange.', ['כתום', 'ירוק', 'סגול'], ['Orange', 'Green', 'Purple'])]},
  { he: 'קפיצים וריחוף (Springs & Float)', en: 'Springs & float', items: [
   it('מה מחזיר את השסתום?', 'What closes the valve?', 'קפיץ.', 'A spring.', ['קפיץ', 'הזיז', 'הרצועה'], ['A spring', 'The lobe', 'The belt']),
   it('מה זה ריחוף שסתומים?', 'What is valve float?', 'השסתום לא מספיק לחזור ונשאר פתוח.', 'The valve cannot keep up and stays open.', ['השסתום לא חוזר בזמן', 'השסתום נסגר מוקדם', 'הזיז נשבר לשניים מעומס'], ['Valve does not close in time', 'Valve closes early', 'Lobe breaks']),
   it('מתי קורה ריחוף?', 'When does float happen?', 'בסל״ד גבוה עם קפיץ חלש.', 'At high revs with a weak spring.', ['סל״ד גבוה וקפיץ חלש', 'בסרק עם קפיץ חזק במיוחד', 'כשהמנוע כבוי'], ['High revs, weak spring', 'Idle, strong spring', 'Engine off']),
   it('למה ריחוף מסוכן?', 'Why is float dangerous?', 'השסתום יכול לפגוע בבוכנה.', 'The valve can hit the piston.', ['פוגע בבוכנה', 'רק רעש קטן', 'אין סכנה'], ['Hits the piston', 'Just a small noise', 'No danger']),
   it('למה לא קפיץ הכי קשה?', 'Why not the stiffest spring?', 'שחיקה וחיכוך.', 'Wear and friction.', ['שחיקה וחיכוך', 'הוא כבד', 'אין בו צורך במנוע קטן'], ['Wear and friction', 'It is heavy', 'Not needed']),
   it('איזה קפיץ בוחרים?', 'Which spring do you pick?', 'החלש ביותר שלא מרחף.', 'The softest that does not float.', ['החלש ביותר שלא מרחף', 'תמיד הקשה ביותר', 'תמיד הרך ביותר'], ['Softest with no float', 'Always the stiffest', 'Always the softest']),
   it('במשחק, איזה קפיץ נותן כוכב?', 'In the game, which spring earns a star?', '3.', '3.', ['3', '1', '5'], ['3', '1', '5']),
   it('מה עוד עושה הקפיץ?', 'What else does the spring do?', 'לוחץ את העוקב אל הזיז.', 'Keeps the follower on the lobe.', ['לוחץ עוקב לזיז', 'מסובב את הציר', 'מקרר את המנוע'], ['Presses follower on lobe', 'Turns the shaft', 'Cools the engine']),
   it('מה מגביל סל״ד במכונית?', 'What limits revs in a car?', 'מחשב המנוע.', 'The engine computer.', ['מחשב המנוע', 'הצמיגים', 'המושב'], ['Engine computer', 'Tyres', 'The seat']),
   it('קפיץ 2 ב-6,500 סל״ד...', 'Spring 2 at 6,500 rpm...', 'מרחף.', 'Floats.', ['מרחף', 'עובד מצוין', 'נשחק'], ['Floats', 'Works great', 'Wears out'])]},
  { he: 'הרמה ועוצמה (Lift & Power)', en: 'Lift & power', items: [
   it('מה עושה זיז הרמה גבוהה?', 'What does a high-lift lobe do?', 'פותח את השסתום יותר.', 'Opens the valve further.', ['פותח יותר', 'סוגר מהר', 'מסתובב לאט'], ['Opens further', 'Closes fast', 'Turns slowly']),
   it('למה זה נותן כוח?', 'Why does it add power?', 'נכנס יותר אוויר.', 'More air flows in.', ['יותר אוויר', 'פחות שמן', 'פחות משקל'], ['More air', 'Less oil', 'Less weight']),
   it('מה החיסרון של הרמה גבוהה?', 'Downside of high lift?', 'קל יותר לרחף.', 'Floats more easily.', ['קל יותר לרחף', 'המנוע חלש יותר', 'אין חיסרון'], ['Floats more easily', 'Weaker engine', 'No downside']),
   it('הרמה גבוהה צריכה...', 'High lift needs...', 'קפיץ מעט חזק יותר.', 'A slightly stronger spring.', ['קפיץ חזק יותר', 'רצועה חלקה', 'פחות זיזים'], ['A stronger spring', 'A smooth belt', 'Fewer lobes']),
   it('קפיץ 3 עם הרמה גבוהה מרחף ב-6,500?', 'Spring 3 with high lift floats at 6,500?', 'לא.', 'No.', ['לא', 'כן', 'רק בסרק'], ['No', 'Yes', 'Only at idle']),
   it('מה מגדיל הרמה?', 'What sets the lift?', 'גובה הבליטה של הזיז.', 'The height of the lobe tip.', ['גובה הבליטה', 'עובי הציר', 'הצבע שצובעים בו את הזיז'], ['Height of the tip', 'Shaft thickness', 'Lobe colour']),
   it('איפה רוצים הרמה גבוהה?', 'Where is high lift wanted?', 'במנועי מרוץ.', 'In racing engines.', ['מנועי מרוץ', 'מכסחת דשא', 'מאוורר'], ['Racing engines', 'A lawnmower', 'A fan']),
   it('האם הרמה גבוהה מתאימה לסרק?', 'Does high lift help at idle?', 'לא במיוחד.', 'Not really.', ['לא במיוחד', 'כן מאוד', 'רק בגשם'], ['Not really', 'Yes, a lot', 'Only in rain']),
   it('מה הכוכב הנוסף נותן?', 'What does the bonus star reward?', 'בחירת זיז הרמה גבוהה.', 'Choosing high-lift lobes.', ['זיז הרמה גבוהה', 'רצועה חלקה', 'קפיץ 5'], ['High-lift lobes', 'A smooth belt', 'Spring 5']),
   it('זיז גבוה עם קפיץ 2...', 'High lift with spring 2...', 'מרחף.', 'Floats.', ['מרחף', 'מושלם', 'נשחק'], ['Floats', 'Perfect', 'Wears'])]},
  { he: 'רצועה ותזמון (Belt & Timing)', en: 'Belt & timing', items: [
   it('מה מסובב את גל הזיזים?', 'What turns the camshaft?', 'רצועה מגל הארכובה.', 'A belt from the crankshaft.', ['רצועה מגל הארכובה', 'מנוע חשמלי נפרד', 'הגלגל הקדמי'], ['A belt from the crank', 'A separate motor', 'The front wheel']),
   it('כמה פעמים מסתובב גל הזיזים?', 'How often does the camshaft turn?', 'פעם על כל שני סיבובים של הארכובה.', 'Once per two crank turns.', ['חצי מהארכובה', 'כמו הארכובה', 'פי שניים מהארכובה'], ['Half the crank', 'Same as the crank', 'Twice the crank']),
   it('למה הגלגל של גל הזיזים גדול יותר?', 'Why is the cam pulley bigger?', 'כדי שיסתובב לאט פי 2.', 'So it turns half as fast.', ['להסתובב לאט פי 2', 'להיות כבד', 'ליופי'], ['Turn half as fast', 'To be heavy', 'For looks']),
   it('למה רצועה משוננת?', 'Why a toothed belt?', 'כדי שלא תחליק.', 'So it never slips.', ['שלא תחליק', 'שתהיה שקטה', 'שתהיה זולה'], ['So it never slips', 'To be quiet', 'To be cheap']),
   it('מה קורה אם הרצועה מחליקה?', 'If the belt slips?', 'השסתומים נפתחים בזמן הלא נכון.', 'The valves open at the wrong time.', ['תזמון לא נכון', 'המנוע מהיר יותר', 'שום דבר'], ['Wrong timing', 'A faster engine', 'Nothing']),
   it('מה מחליף רצועה בחלק מהמנועים?', 'What replaces the belt in some engines?', 'שרשרת.', 'A chain.', ['שרשרת', 'חבל', 'גומייה'], ['A chain', 'A rope', 'A rubber band']),
   it('מה החלק האחרון שבונים?', 'Which part goes on last?', 'הרצועה.', 'The belt.', ['הרצועה', 'הראש', 'הציר'], ['The belt', 'The head', 'The shaft']),
   it('למה מחליפים רצועה כל כמה שנים?', 'Why replace the belt every few years?', 'היא מתבלה ויכולה להיקרע.', 'It ages and can snap.', ['מתבלה ונקרעת', 'משנה צבע', 'נהיית קצרה'], ['Ages and snaps', 'Changes colour', 'Gets shorter']),
   it('מה מתוזמן עם השסתומים?', 'What are the valves timed to?', 'הבוכנה.', 'The piston.', ['הבוכנה', 'הרדיו', 'ההגה'], ['The piston', 'The radio', 'The steering']),
   it('רצועה חלקה במשחק היא...', 'In the game a smooth belt is...', 'חלק שגוי.', 'A wrong part.', ['חלק שגוי', 'החלק הטוב', 'בונוס'], ['A wrong part', 'The best part', 'A bonus'])]}
 ]
};
window.MF_PARTS = {
 head: ['camshaft', 'ראש מנוע (Cylinder Head)', 'Cylinder head', 'החלק העליון של המנוע. שקוף כדי לראות את מה שבפנים.', 'The top of the engine, see-through so we can watch inside.', 'מתאים! הכול יושב בו.', 'It fits – everything sits in it.', 'בכל מנוע בנזין.', 'In every petrol engine.'],
 shaft: ['camshaft', 'גל זיזים (Camshaft)', 'Camshaft', 'ציר עם 4 זיזים בצורת ביצה.', 'A shaft with 4 egg-shaped lobes.', 'מתאים! הוא קובע מתי כל שסתום נפתח.', 'It fits – it decides when each valve opens.', 'במנועים ובמכונות תפירה.', 'In engines and sewing machines.'],
 followers: ['camshaft', 'עוקבים (Followers)', 'Followers', 'כוסות שיושבות על הזיזים.', 'Cups riding on the lobes.', 'מתאים! הם מעבירים את הדחיפה לשסתום.', 'It fits – they pass the push to the valve.', 'בכל מנוע עם גל זיזים.', 'In every camshaft engine.'],
 valves: ['camshaft', 'שסתומים (Valves)', 'Valves', 'פקקים בצורת פטרייה שפותחים לאוויר.', 'Mushroom-shaped plugs that open for air.', 'מתאים! דרכם המנוע נושם.', 'It fits – the engine breathes through them.', 'בכל מנוע.', 'In every engine.'],
 springs: ['spring', 'קפיצי שסתום (Valve Springs)', 'Valve springs', 'קפיצים שמחזירים את השסתומים.', 'Springs that close the valves.', 'מתאים! בלעדיהם השסתום לא נסגר.', 'It fits – without them the valve never closes.', 'בכל מנוע.', 'In every engine.'],
 belt: ['camshaft', 'רצועת תזמון (Timing Belt)', 'Timing belt', 'רצועה משוננת מגל הארכובה.', 'A toothed belt from the crankshaft.', 'מתאים! היא שומרת על התזמון.', 'It fits – it keeps the timing.', 'ברוב המכוניות.', 'In most cars.'],
 round: ['camshaft', 'דיסקים עגולים (Round Discs)', 'Round discs', 'ציר עם דיסקים עגולים לגמרי.', 'A shaft with perfectly round discs.', 'לא מתאים: עיגול לא דוחף כלום.', 'Does not fit: a circle pushes nothing.', 'בגלגלות.', 'In pulleys.'],
 weak: ['spring', 'קפיצים רכים (Soft Springs)', 'Soft springs', 'קפיצים חלשים מאוד.', 'Very weak springs.', 'לא מתאים: ריחוף כבר בסל״ד בינוני.', 'Does not fit: float even at medium revs.', 'בעטים.', 'In pens.'],
 vbelt: ['camshaft', 'רצועה חלקה (Smooth Belt)', 'Smooth belt', 'רצועה בלי שיניים.', 'A belt without teeth.', 'לא מתאים: מחליקה והתזמון זז.', 'Does not fit: it slips and timing drifts.', 'במאווררים ובמכונות כביסה.', 'In fans and washing machines.']
};
})();
