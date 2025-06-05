/*!
 * Summernote Accordion Plugin
 * https://github.com/your-repo/summernote-accordion
 *
 * Released under the MIT license
 */
(function (factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as anonymous module.
    define(['jquery'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // Node/CommonJS
    module.exports = factory(require('jquery'));
  } else {
    // Browser globals
    factory(window.jQuery);
  }
}(function ($) {
  $.summernote = $.summernote || {};
  $.summernote.plugins = $.summernote.plugins || {};

  $.summernote.plugins['accordion'] = function (context) {
    var self = this;
    var ui = $.summernote.ui;
    var $editor = context.layoutInfo.editor;
    var $note = context.layoutInfo.note;
    var $editable = context.layoutInfo.editable;
    var options = context.options;
    var lang = options.langInfo;

    // Inject Accordion Modal HTML if not exists
    function ensureAccordionModal() {
      if ($('#accordionModal').length === 0) {
        var modalHtml = `
  <div class="modal fade" id="accordionModal" tabindex="-1" role="dialog" aria-labelledby="accordionModalLabel">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <form id="accordionForm">
          <div class="modal-header">
            <h4 class="modal-title" id="accordionModalLabel">Thêm Accordion</h4>
          </div>
          <div class="modal-body">
            <div id="accordion-items">
              <div class="panel panel-default accordion-item">
                <div class="panel-heading">
                  <input type="text" class="form-control" name="title[]" placeholder="Tiêu đề mục Accordion" required>
                </div>
                <div class="panel-body">
                  <textarea class="form-control" name="content[]" placeholder="Nội dung" required></textarea>
                </div>
              </div>
            </div>
            <button type="button" class="btn btn-default" id="addAccordionItem">+ Thêm mục</button>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-default" data-dismiss="modal">Hủy</button>
            <button type="submit" class="btn btn-primary">Chèn Accordion</button>
          </div>
        </form>
      </div>
    </div>
  </div>`;
        $(document.body).append(modalHtml);
      }
    }

    // --- Lưu và khôi phục vị trí con trỏ khi mở modal ---
    var lastRange = null;

    // Add Accordion Button
    context.memo('button.accordion', function () {
      ensureAccordionModal();
      return ui.button({
        contents: '<i class="glyphicon glyphicon-list-alt"></i> Accordion',
        tooltip: 'Chèn Accordion',
        click: function () {
          // Lưu lại range trước khi mở modal
          lastRange = context.invoke('editor.createRange');
          showAccordionModal();
        }
      }).render();
    });

    // Show Modal
    function showAccordionModal(editTarget, editAccordionId) {
      var $modal = $('#accordionModal');
      if ($modal.length === 0) return;
      // Reset form
      var $form = $modal.find('#accordionForm');
      $form[0].reset();
      $form.removeData('edit-target').removeData('edit-accordion-id');
      var $items = $modal.find('#accordion-items');
      $items.html($items.find('.accordion-item:first').clone());
      $items.find('input, textarea').val('');
      if (editTarget && editAccordionId) {
        // Fill data for edit
        var $group = $(editTarget);
        var $panels = $group.find('.panel');
        $items.empty();
        $panels.each(function () {
          var title = $(this).find('.panel-title a').first().text();
          var content = $(this).find('.panel-body').first().html();
          var $item = $(
            '<div class="panel panel-default accordion-item">' +
            '<div class="panel-heading">' +
            '<input type="text" class="form-control" name="title[]" placeholder="Tiêu đề mục Accordion" required>' +
            '</div>' +
            '<div class="panel-body">' +
            '<textarea class="form-control" name="content[]" placeholder="Nội dung" required></textarea>' +
            '</div>' +
            '</div>'
          );
          $item.find('input').val(title);
          $item.find('textarea').val(content);
          $items.append($item);
        });
        $form.data('edit-target', $group);
        $form.data('edit-accordion-id', editAccordionId);
      }
      $modal.modal('show');
    }

    // Add Accordion Items
    $(document).on('click', '#addAccordionItem', function () {
      var item = $('#accordion-items .accordion-item:first').clone();
      item.find('input, textarea').val('');
      $('#accordion-items').append(item);
    });

    // Handle Accordion Form Submit
    $(document)
      .off('submit.smn-acc')
      .on('submit.smn-acc', '#accordionForm', function (e) {
        e.preventDefault();
        var $form = $(this);
        var $editTarget = $form.data('edit-target');
        var editAccordionId = $form.data('edit-accordion-id');
        var titles = $form.find("input[name='title[]']").map(function () { return $(this).val(); }).get();
        var contents = $form.find("textarea[name='content[]']").map(function () { return $(this).val(); }).get();
        var accordionId = editAccordionId || ('accordion-' + Date.now().toString(36));
        var html = '<div class="panel-group" id="' + accordionId + '" role="tablist" aria-multiselectable="true">';
        for (var i = 0; i < titles.length; i++) {
          var collapseId = accordionId + '-collapse' + i;
          html +=
            '<div class="panel panel-default">' +
            '<div class="panel-heading" role="tab" id="' + collapseId + '-heading" style="cursor:pointer;">' +
            '<h4 class="panel-title" style="margin:0;">' +
            '<a class="accordion-toggle' + (i === 0 ? '' : ' collapsed') + '" data-toggle="collapse" data-parent="#' + accordionId + '" href="#' + collapseId + '" aria-expanded="' + (i === 0 ? 'true' : 'false') + '" aria-controls="' + collapseId + '" style="display:block; width:100%; text-decoration:none;">' +
            titles[i] +
            '</a>' +
            '</h4>' +
            '</div>' +
            '<div id="' + collapseId + '" class="panel-collapse collapse' + (i === 0 ? ' in' : '') + '" role="tabpanel" aria-labelledby="' + collapseId + '-heading">' +
            '<div class="panel-body">' + contents[i] + '</div>' +
            '</div>' +
            '</div>';
        }
        if ($editTarget && $editTarget.length) {
          $editTarget.replaceWith($(html));
          $form.removeData('edit-target');
          $form.removeData('edit-accordion-id');
        } else {
          // Khôi phục lại range trước khi chèn
          if (lastRange && lastRange.select) {
            lastRange.select();
          }
          context.invoke('editor.focus');
          var range = context.invoke('editor.createRange');
          if (range && range.insertNode) {
            var tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            var nodes = Array.from(tempDiv.childNodes);
            var lastNode = null;
            nodes.forEach(function (node) {
              lastNode = range.insertNode(node.cloneNode(true));
            });
            // Thêm 1 dòng trống sau accordion
            var br = document.createElement('p');
            br.innerHTML = '<br>';
            if (lastNode && lastNode.parentNode) {
              if (lastNode.nextSibling) {
                lastNode.parentNode.insertBefore(br, lastNode.nextSibling);
              } else {
                lastNode.parentNode.appendChild(br);
              }
              // Đặt con trỏ vào dòng trống vừa thêm
              var sel = window.getSelection();
              var range2 = document.createRange();
              range2.setStart(br, 0);
              range2.collapse(true);
              sel.removeAllRanges();
              sel.addRange(range2);
            }
          } else {
            context.invoke('editor.pasteHTML', html + '<p><br></p>');
            // Đặt con trỏ vào cuối editor (fallback)
            setTimeout(function () {
              var editor = $editable[0];
              if (editor) {
                var range2 = document.createRange();
                var selection = window.getSelection();
                range2.selectNodeContents(editor);
                range2.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range2);
                editor.focus();
              }
            }, 0);
          }
        }
        $('#accordionModal').modal('hide');
        // Reset form
        var $items = $('#accordion-items');
        $items.html($items.find('.accordion-item:first').clone());
        $items.find('input, textarea').val('');
        // Xóa range tạm sau khi dùng
        lastRange = null;
      });

    // Toggle accordion on heading click
    $(document)
      .off('click.smn-acc-heading')
      .on('click.smn-acc-heading', '.panel-heading', function (e) {
        if ($(e.target).is('a')) return;
        var $toggle = $(this).find('a.accordion-toggle');
        if ($toggle.length) { $toggle.trigger('click'); }
      });

    // Add Edit/Delete buttons on hover
    $(document)
      .off('mouseenter.smn-acc')
      .on('mouseenter.smn-acc', '.panel-group .panel', function () {
        if ($(this).find('.accordion-edit-btn').length === 0) {
          var $group = $(this).closest('.panel-group');
          var groupId = $group.attr('id') || '';
          var $editBtn = $('<button type="button" class="accordion-edit-btn btn btn-xs btn-info" style="position:absolute;top:8px;right:48px;z-index:10;" title="Sửa"><span class="glyphicon glyphicon-pencil"></span></button>');
          var $deleteBtn = $('<button type="button" class="accordion-delete-btn btn btn-xs btn-danger" style="position:absolute;top:8px;right:8px;z-index:10;" title="Xóa"><span class="glyphicon glyphicon-trash"></span></button>');
          $editBtn.attr('data-accordion-id', groupId);
          $deleteBtn.attr('data-accordion-id', groupId);
          $(this).css('position', 'relative').append($editBtn).append($deleteBtn);
        }
      });
    $(document)
      .off('mouseleave.smn-acc')
      .on('mouseleave.smn-acc', '.panel-group .panel', function () {
        $(this).find('.accordion-edit-btn, .accordion-delete-btn').remove();
      });

    // Edit
    $(document)
      .off('click.smn-acc-edit')
      .on('click.smn-acc-edit', '.accordion-edit-btn', function (e) {
        e.stopPropagation();
        var accordionId = $(this).attr('data-accordion-id');
        var $group = $(".panel-group[id='" + accordionId + "']");
        if ($group.length === 0) return;
        showAccordionModal($group, accordionId);
      });

    // Delete
    $(document)
      .off('click.smn-acc-delete')
      .on('click.smn-acc-delete', '.accordion-delete-btn', function (e) {
        e.stopPropagation();
        var accordionId = $(this).attr('data-accordion-id');
        var $panel = $(this).closest('.panel');
        var $group = $(".panel-group#" + accordionId);
        $panel.remove();
        if ($group.find('.panel').length === 0) { $group.remove(); }
      });

    // Prevent editing accordion in editor
    $(document)
      .off('mousedown.smn-acc click.smn-acc focus.smn-acc keydown.smn-acc keypress.smn-acc input.smn-acc')
      .on('mousedown.smn-acc click.smn-acc focus.smn-acc keydown.smn-acc keypress.smn-acc input.smn-acc', '.panel-group .panel-title, .panel-group .panel-body', function (e) {
        if (!$(this).closest('#accordionModal').length) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      });
    $(document)
      .off('mousedown.smn-acc2 click.smn-acc2 focus.smn-acc2 keydown.smn-acc2 keypress.smn-acc2 input.smn-acc2')
      .on('mousedown.smn-acc2 click.smn-acc2 focus.smn-acc2 keydown.smn-acc2 keypress.smn-acc2 input.smn-acc2', '.panel-group .panel input, .panel-group .panel textarea', function (e) {
        if (!$(this).closest('#accordionModal').length) {
          e.preventDefault();
          e.stopPropagation();
          $(this).blur();
          return false;
        }
      });
  };
}));
