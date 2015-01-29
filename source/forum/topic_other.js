// topic other improvements
var checkHash = function() {
	// scroll to a certain post #
	var guip_hash = location.hash.match(/#guip_(\d+)/);
	if (guip_hash) {
		var post = $C('spacer')[+guip_hash[1]];
		location.hash = post ? post.id : '';
	}
};
var setPageWrapperPaddingBottom = function(el) {
	var form = document.getElementById(el) || el,
		old_height = parseFloat(getComputedStyle(form).height) || 0,
		step = 0;
	clearInterval(pw_pb_int);
	pw_pb_int = setInterval(function() {
		if (step++ >= 100) {
			clearInterval(pw_pb_int);
		} else {
			var diff = (parseFloat(getComputedStyle(form).height) || 0) - old_height;
			old_height += diff;
			pw.style.paddingBottom = ((parseFloat(pw.style.paddingBottom) || 0) + diff) + 'px';
			worker.scrollTo(0, worker.scrollY + diff);
		}
	}, 10);
};
var fixPageWrapperPadding = function() {
	pw = document.getElementById('page_wrapper');
	worker.Effect.old_toggle = worker.Effect.toggle;
	worker.Effect.toggle = function(a, b) { setPageWrapperPaddingBottom(a); worker.Effect.old_toggle(a, b); };
	worker.Effect.old_BlindDown = worker.Effect.BlindDown;
	worker.Effect.BlindDown = function(a, b) { setPageWrapperPaddingBottom(a); worker.Effect.old_BlindDown(a, b); };
	worker.EditForm.old_hide = worker.EditForm.hide;
	worker.EditForm.hide = function(dummy) { pw.style.paddingBottom = '0px'; worker.EditForm.old_hide(); };
	worker.EditForm.old_setReplyId = worker.EditForm.setReplyId;
	worker.EditForm.setReplyId = function(a) { if (document.getElementById('reply').style.display !== 'none') { pw.style.paddingBottom = '0px'; } worker.EditForm.old_setReplyId(a); };
};
var fixGodnamePaste = function() {
	worker.ReplyForm.add_name = function(name) {
		try {
			var editor;
			if (document.getElementById('edit').style.display !== 'none' && document.getElementById('edit_body')) {
				editor = document.getElementById('edit_body');
			} else {
				editor = document.getElementById('post_body');
				if (document.getElementById('reply').style.display === 'none') {
					worker.ReplyForm.init();
				}
			}
			initEditor(editor);
			var pos = editor.selectionDirection === 'backward' ? ss : se;
			editor.value = val.slice(0, pos) + '*' + name + '*, ' + val.slice(pos);
			setTimeout(function() {
				putSelectionTo(editor, pos + name.length + 4, false);
			}, 50);
		} catch(error) {
			worker.console.error(error);
		}
	};
};
var picturesAutoreplace = function() {
	if (!storage.get('Option:disableLinksAutoreplace')) {
		var links = document.querySelectorAll('.post .body a'),
			imgs = [],
			onerror = function(i) {
				links[i].removeChild(links[i].getElementsByTagName('img')[0]);
				imgs[i] = undefined;
			},
			onload = function(i) {
				links[i].removeChild(links[i].getElementsByTagName('img')[0]);
				var hint = links[i].innerHTML;
				links[i].outerHTML = '<div class="img_container"><a id="link' + i + '" href="' + links[i].href + '" target="_blank" alt="' + worker.GUIp_i18n.open_in_a_new_tab + '"></a><div class="hint">' + hint + '</div></div>';
				imgs[i].alt = hint;
				var new_link = document.getElementById('link' + i);
				new_link.appendChild(imgs[i]);
			};
		for (i = 0, len = links.length; i < len; i++) {
			if (links[i].href.match(/jpe?g|png|gif/)) {
				links[i].insertAdjacentHTML('beforeend', '<img src="http://godville.net/images/spinner.gif">');
				imgs[i] = document.createElement('img');
				imgs[i].onerror = onerror.bind(null, i);
				imgs[i].onload = onload.bind(null, i);
				imgs[i].src = links[i].href;
			}
		}
	}
};
var improveTopic = function() {
	checkHash();
	fixPageWrapperPadding();
	fixGodnamePaste();
	picturesAutoreplace();
};