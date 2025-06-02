// Summernote Accordion Plugin Button
window.AccordionButton = function (context) {
    var ui = $.summernote.ui;
    var button = ui.button({
        contents: '<i class="glyphicon glyphicon-list-alt"></i> Accordion',
        tooltip: 'Chèn Accordion',
        click: function () {
            $('#accordionModal').modal('show');
        }
    });
    return button.render();
};

// Thêm nút Edit cho từng accordion khi hover
$(document).on('mouseenter', '.panel-group .panel', function () {
    if ($(this).find('.accordion-edit-btn').length === 0) {
        var $btn = $('<button type="button" class="accordion-edit-btn btn btn-xs btn-info" style="position:absolute;top:8px;right:8px;z-index:10;">Sửa</button>');
        $(this).css('position', 'relative').append($btn);
    }
});
$(document).on('mouseleave', '.panel-group .panel', function () {
    $(this).find('.accordion-edit-btn').remove();
});

// Khi click nút Edit, show modal và điền dữ liệu vào form
$(document).on('click', '.accordion-edit-btn', function (e) {
    e.stopPropagation();
    var $panel = $(this).closest('.panel');
    var $group = $panel.closest('.panel-group');
    var $panels = $group.find('.panel');
    // Lấy dữ liệu các item
    var titles = [];
    var contents = [];
    $panels.each(function () {
        var title = $(this).find('.panel-title a').first().text();
        var content = $(this).find('.panel-body').first().html();
        titles.push(title);
        contents.push(content);
    });
    // Đổ dữ liệu vào modal
    var $items = $('#accordion-items');
    $items.empty();
    for (var i = 0; i < titles.length; i++) {
        // Clone mẫu từ DOM gốc (luôn lấy từ modal gốc để tránh lỗi lặp lồng nhau)
        var $template = $('#accordionModal .accordion-item').first().clone();
        $template.find('input').val(titles[i]);
        $template.find('textarea').val(contents[i]);
        $items.append($template);
    }
    // Xóa item mẫu thừa nếu có nhiều hơn số item thực tế
    $items.find('.accordion-item').slice(titles.length).remove();
    // Lưu lại accordion đang sửa
    $('#accordionForm').data('edit-target', $group);
    $('#accordionModal').modal('show');
});

// Khi submit, nếu đang edit thì thay thế accordion cũ
$('#accordionForm').on('submit', function (e) {
    e.preventDefault();
    var $form = $(this);
    var $editTarget = $form.data('edit-target');
    // ...existing code...
    var html = '<div class="panel-group">' + /* generate your html here */ + '</div>';
    if ($editTarget && $editTarget.length) {
        $editTarget.replaceWith($(html));
        $form.removeData('edit-target');
    } else {
        $('#summernote').summernote('pasteHTML', html);
    }
    $('#accordionModal').modal('hide');
});
