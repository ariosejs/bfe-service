<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>spec</title>
</head>
<body>
	<form action="/publish" method="post" target="_wa" class="f-1 f-f f-v">
            <label for="stub">stub</label>
            <input type="text" id="stub" name="stub" value="demo" required="required"/>
            <label for="strict">strict</label>
            <input type="number" min="0" id="strict" name="strict" value="0"/>
            <label for="tpl">tpl</label>
            <input type="text" id="tpl" name="tpl" value="404"/>
            <label for="test">test</label>
            <input type="checkbox" id="test" name="test"/>
            <label for="engine">engine</label>
            <select name="engine" id="engine">
                <option value="">default</option>
                <option value="twig" selected>twig</option>
                <option value="mustache">mustache</option>
            </select>
            <label for="tasks">tasks</label>
            <textarea id="tasks" name="tasks" required="required">
{"cmsTpl":"index","cmsTarget":"index","cmsPayload":{"title":"hello world"}}
            </textarea>
            <label for="remote">remote</label>
            <textarea id="remote" name="remote"></textarea>
            <button type="submit">Submit to Test</button>
    </form>
</body>
</html>