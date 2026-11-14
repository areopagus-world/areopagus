# Review: Русский

Model: claude-opus-5-5

## Verdict
minor issues: the page mostly reads well, but a handful of calques ("встанет на путь", "называет всех", "не покупает"), unneeded anglicisms ("Спэйс", "Комьюнити") and one plural bug break the plain, native tone.

## Issues
| key | current | problem | suggested text |
|---|---|---|---|
| lead | …и её можно строить вместе с нами. | The impersonal "можно" drops the direct "you" that the rest of the page uses. | …и вы можете строить её вместе с нами. |
| pathText | Дат здесь нет, есть честный порядок. | "only" is lost, and the sentence sounds flat. | Дат здесь нет, только честный порядок. |
| state.next | следом | This is an odd stand-alone status label. "на очереди" is the natural phrase. | на очереди |
| nodes.4 | Юридический дом проекта | A literal calque. "Legal home" means a legal entity for the project. | Юридическое лицо для проекта |
| nodes.5 | Спэйс | An unneeded anglicism with nonstandard spelling (normally "спейс"). It also loses "Your". | Своё пространство |
| nodes.6 | Хронология | "Хронология" means a timeline of dates. A feed or chronicle is "Хроника". | Хроника |
| nodes.7 | Комьюнити | Slang anglicism that clashes with "Лавка" and "Общее дело". | Сообщества |
| nodes.13 | Оплата без отказов | Reads as "payments that never fail technically". The point is that nobody can block them. | Платежи, которые никто не заблокирует |
| nodes.15 | Сообщения с шифрованием | Clunky. | Зашифрованные сообщения |
| nodes.16 | Лаборатории и проекты | "joint" is lost. | Лаборатории и совместные проекты |
| joinText | Каждый выпуск называет всех, кто приложил к нему руку, по алфавиту. | "выпуск называет" is a calque. | В каждом выпуске по алфавиту перечислены все, кто приложил к нему руку. |
| ways.0.1 | Она встанет на путь контуром рядом со своей ветвью. | "встать на путь" is an idiom meaning "to embark on a course", so the line reads oddly. | Она появится на пути контуром рядом со своей веткой. |
| ways.1.1 | Числа стоят у идей и никогда у людей. | "стоят у" is awkward and the contrast is weak. | Числа есть только у идей, у людей — никогда. |
| ways.2.0 | Взять дело | "дело" suggests a case or file. | Взять задачу |
| ways.3.1 | Войдите в круг, которому новое включают раньше всех. | Awkward syntax, and "включают" is jargon. | Вступите в круг тех, кто получает новое раньше всех. |
| supText | Пока проект ведёт его основатель… поддержка считается его доходом от дела… | "Пока" can be misread as "while". "доход от дела" is not the real term. | Пока что проект ведёт основатель как индивидуальный предприниматель во Франции, поэтому поддержка — это его предпринимательский доход, а не благотворительное пожертвование. |
| ledger | записей в журнале | The fixed genitive plural breaks with 1, 2–4, 21… ("1 записей"). It needs plural forms. | Use ICU plural: one "запись в журнале", few "записи в журнале", many "записей в журнале" |
| rules.1 | Пожертвование не покупает вес голоса, место в выдаче и знак отличия. | A negated list needs "ни… ни…". "не покупает" is a calque, and "знак отличия" sounds like a military award. | Пожертвование не даёт ни веса голоса, ни места в выдаче, ни значка. |
| engText | Ареопаг ещё и движок. Спэйс, лавку или комьюнити можно вынести… | A dash is missing between subject and predicate. The anglicisms should match nodes.5 and nodes.7. | Ареопаг — это ещё и движок. Своё пространство, лавку или сообщество можно вынести на собственный домен по подписке. Код открыт, поэтому любой может поднять его сам и бесплатно. |

## Register
The page uses polite plural «вы» (Добавьте, Войдите, Ваше имя), lowercase inside sentences. This is the right choice for a 15–60 aud
