<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <title>
            ChunBo Front-End Service
        </title>
    </head>
    <body>
    <h1>/publish</h1>
    <dl>
    	<dt>Simple</dt>
    	<dd>
POST:
    strict:0
    tasks:[
            {
                "cmsTpl":"demo/index",
                "cmsTarget":"demo/index",
                "cmsPayload":{
                    "word":"Hello Kitty"
                }
            }
        ]
    	</dd>
		<dt>Fast</dt>
		<dd>
			1.Nodejs with cluster
			2.Mature template engine
		</dd>
		<dt>Flexable</dt>
		<dd>
			I.Multiple template engines
			II.Any transport data format
			III.Independent task process
		</dd>
    </dl>
    <ul>
    	<li><a href="/list">List</a></li>
    	<li><a href="/guide">Guide</a></li>
    	<li><a href="/spec">Spec</a></li>
    </ul>
</body>
</html>