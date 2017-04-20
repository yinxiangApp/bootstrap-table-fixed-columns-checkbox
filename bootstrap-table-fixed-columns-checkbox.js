/**
 * @author zhixin wen <wenzhixin2010@gmail.com>
 * @version: v1.0.1
 */

(function ($) {
    'use strict';

    $.extend($.fn.bootstrapTable.defaults, {
        fixedColumns: false,
        fixedNumber: 1
    });

    var BootstrapTable = $.fn.bootstrapTable.Constructor,
        _initHeader = BootstrapTable.prototype.initHeader,
        _initBody = BootstrapTable.prototype.initBody,
        _resetView = BootstrapTable.prototype.resetView;

    BootstrapTable.prototype.initFixedColumns = function () {
        this.$fixedHeader = $([
            '<div class="fixed-table-header-columns">',
            '<table>',
            '<thead></thead>',
            '</table>',
            '</div>'].join(''));

        this.timeoutHeaderColumns_ = 0;
        this.$fixedHeader.find('table').attr('class', this.$el.attr('class'));
        this.$fixedHeaderColumns = this.$fixedHeader.find('thead');
        this.$tableHeader.before(this.$fixedHeader);

        this.$fixedBody = $([
            '<div class="fixed-table-body-columns">',
            '<table>',
            '<tbody></tbody>',
            '</table>',
            '</div>'].join(''));

        this.timeoutBodyColumns_ = 0;
        this.$fixedBody.find('table').attr('class', this.$el.attr('class'));
        this.$fixedBodyColumns = this.$fixedBody.find('tbody');
        this.$tableBody.before(this.$fixedBody);
    };

    BootstrapTable.prototype.initHeader = function () {
        _initHeader.apply(this, Array.prototype.slice.apply(arguments));

        if (!this.options.fixedColumns) {
            return;
        }

        this.initFixedColumns();

        var that = this, $trs = this.$header.find('tr').clone();
        $trs.each(function () {
            $(this).find('th:gt(' + that.options.fixedNumber + ')').remove();
        });
        this.$fixedHeaderColumns.html('').append($trs);
    };

    BootstrapTable.prototype.initBody = function () {
        _initBody.apply(this, Array.prototype.slice.apply(arguments));

        if (!this.options.fixedColumns) {
            return;
        }

        var that = this,
            rowspan = 0;

        this.$fixedBodyColumns.html('');
        this.$body.find('> tr[data-index]').each(function () {
            var $tr = $(this).clone(),
                $tds = $tr.find('td');

            $tr.html('');
            var end = that.options.fixedNumber;
            if (rowspan > 0) {
                --end;
                --rowspan;
            }
            for (var i = 0; i < end; i++) {
                $tr.append($tds.eq(i).clone());
            }
            that.$fixedBodyColumns.append($tr);

            if ($tds.eq(0).attr('rowspan')){
                rowspan = $tds.eq(0).attr('rowspan') - 1;
            }
        });
    };

    BootstrapTable.prototype.resetView = function () {
        _resetView.apply(this, Array.prototype.slice.apply(arguments));

        if (!this.options.fixedColumns) {
            return;
        }

        clearTimeout(this.timeoutHeaderColumns_);
        this.timeoutHeaderColumns_ = setTimeout($.proxy(this.fitHeaderColumns, this), this.$el.is(':hidden') ? 100 : 0);

        clearTimeout(this.timeoutBodyColumns_);
        this.timeoutBodyColumns_ = setTimeout($.proxy(this.fitBodyColumns, this), this.$el.is(':hidden') ? 100 : 0);
    };

    BootstrapTable.prototype.fitHeaderColumns = function () {
        var that = this,
            visibleFields = this.getVisibleFields(),
            headerWidth = 0;

        this.$body.find('tr:first-child:not(.no-records-found) > *').each(function (i) {
            var $this = $(this),
                index = i;

            if (i >= that.options.fixedNumber) {
                return false;
            }

            if (that.options.detailView && !that.options.cardView) {
                index = i - 1;
            }

            that.$fixedHeader.find('th[data-field="' + visibleFields[index] + '"]')
                .find('.fht-cell').width($this.innerWidth());
            headerWidth += $this.outerWidth();
        });
        this.$fixedHeader.width(headerWidth + 1).show();
    };

    BootstrapTable.prototype.fitBodyColumns = function () {
        var that = this,
            top = -(parseInt(this.$el.css('margin-top')) - 2),
            // the fixed height should reduce the scorll-x height
            height = this.$tableBody.height() - 14;

        if (!this.$body.find('> tr[data-index]').length) {
            this.$fixedBody.hide();
            return;
        }

        if (!this.options.height) {
            top = this.$fixedHeader.height();
            height = height - top;
        }

        this.$fixedBody.css({
            width: this.$fixedHeader.width(),
            height: height,
            top: top
        }).show();

        this.$body.find('> tr').each(function (i) {
            that.$fixedBody.find('tr:eq(' + i + ')').height($(this).height() - 1);
        });

        // events
        this.$tableBody.on('scroll', function () {
            that.$fixedBody.find('table').css('top', -$(this).scrollTop());
        });
        this.$body.find('> tr[data-index]').off('hover').hover(function () {
            var index = $(this).data('index');
            that.$fixedBody.find('tr[data-index="' + index + '"]').addClass('hover');
        }, function () {
            var index = $(this).data('index');
            that.$fixedBody.find('tr[data-index="' + index + '"]').removeClass('hover');
        });
        this.$fixedBody.find('tr[data-index]').off('hover').hover(function () {
            var index = $(this).data('index');
            that.$body.find('tr[data-index="' + index + '"]').addClass('hover');
        }, function () {
            var index = $(this).data('index');
            that.$body.find('> tr[data-index="' + index + '"]').removeClass('hover');
        });

        /// AddBy yinxiang BEGIN
        this.$body.find('input[data-index]').change(function () {
            var index = $(this).data('index');
            var obj = that.$fixedBody.find('input[data-index="' + index + '"]')

            if(obj.length > 0 && !obj[0].disabled) {
	            if(obj[0].checked != $(this)[0].checked){
	            	obj.prop('checked', $(this)[0].checked);
	            }

	            if(obj[0].checked){
	            	that.$fixedBody.find('tr[data-index="' + index + '"]').addClass('selected');
	            } else {
	            	that.$fixedBody.find('tr[data-index="' + index + '"]').removeClass('selected');
	            }
            }
        });
        this.$fixedBody.find('input[data-index]').off('click').on('click', function (event) {//.change(function (event) {
        	event.stopImmediatePropagation();

            var index = $(this).data('index');
            var obj = that.$body.find('input[data-index="' + index + '"]');

            if($(this)[0].checked){
            	that.check(index);
            } else {
            	that.uncheck(index);
            }

            if($(this)[0].checked){
            	that.$fixedBody.find('tr[data-index="' + index + '"]').addClass('selected');
            } else {
            	that.$fixedBody.find('tr[data-index="' + index + '"]').removeClass('selected');
            }

        });

        this.$fixedBody.find('tr[data-index]').on('click', function () {
        	var index = $(this).data('index');

        	var obj = that.$fixedBody.find('input[data-index="' + index + '"]');

        	if(obj.length > 0 && !obj[0].disabled) {
        		obj.prop('checked', !obj[0].checked);

        		if(obj[0].checked){
            		that.check(index);
                	that.$fixedBody.find('tr[data-index="' + index + '"]').addClass('selected');
                } else {
                	that.uncheck(index);
            		that.$fixedBody.find('tr[data-index="' + index + '"]').removeClass('selected');
                }
        	}
        });
      /// AddBy yinxiang END
    };

	/// AddBy yinxiang BEGIN
    BootstrapTable.prototype.checkAll_ = function (checked) {
        var rows;
        if (!checked) {
            rows = this.getSelections();
        }
        this.$selectItem.filter(':enabled').prop('checked', checked);
        this.updateRows();
        this.updateSelected();
        if (checked) {
            rows = this.getSelections();
        }
        this.trigger(checked ? 'check-all' : 'uncheck-all', rows);

        var objs = this.$fixedBody.find('input[data-index]');
        for(var i = 0; i < objs.length; i++) {
        	if(!objs[i].disabled) {
				if(checked){
					$('tr[data-index="' + i + '"]').addClass('selected');
					$('input[data-index="' + i + '"]').prop('checked', true);
				} else {
					$('tr[data-index="' + i + '"]').removeClass('selected');
					$('input[data-index="' + i + '"]').prop('checked', false);
				}
        	}
        }
    };
	/// AddBy yinxiang END

})(jQuery);
