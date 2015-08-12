NovaExports.exports={"stylesheet":"\n        :host {display:none;}\n    ","template":"\n    "};
        'use strict';
        window.TemplateRepeat = NovaExports({
            is: 'template-repeat',
            extends: 'template',
            props: {
                items: {
                    type: Array,
                    value: function() {
                        return []
                    }
                },
                as: {
                    type: String,
                    value: 'item'
                },
                indexAs: {
                    type: String,
                    value: 'index'
                },
                parentSelector: String
            },
            createdHandler: function() {
                let self = this;

                this.insertParent = this.parentSelector ? this.parentElement.querySelector(this.parentSelector) :  this.parentElement;

                // NOTICE: 通过setTimeout，保证使用js通过wrap创建元素后，能获取内部的template-repeat
                setTimeout(function() {
                    self.parentElement && self.parentElement.removeChild(self);
                }, 0);

                this.on('_itemsChanged', this._itemsObserver);
                this.notifyPath('items');
            },
            _itemsObserver: function(ev, oldVal, newVal, path) {
                if(path != 'items' || !newVal || newVal.constructor != Array) { return; }

                this.itemNodes = this.itemNodes || [];

                // 删除所有项
                for(let i = this.itemNodes.length - 1; i >= 0; i--) {
                    this.removeItem(i);
                }
                // 添加新项
                for(let i = 0, len = newVal.length; i < len; i++) {
                    this.appendItem(i);
                }
            },
            appendItem: function(index) {
                let self = this;

                let item = new TemplateRepeatItem({
                    props: {
                        as: this.as,
                        indexAs: this.indexAs,
                        index: index,
                        item: self.items[index],
                        template: this.innerHTML,
                        insertParent: this.insertParent,
                    },
                    beforeCreated: function() {
                        self.compileNodes(this);
                        self.bindNodeByConfigs(this, [{
                            type: Nova.ExpressionParser.BIND_TYPES.PROPERTY,
                            value: '{{items.' + index + '}}',
                            name: self.as
                        }, {
                            type: Nova.ExpressionParser.BIND_TYPES.EVENT,
                            callback: 'itemChangedHandler',
                            event: self._getPropChangeEventName(self.as)
                        }]);
                    }
                });


                this.itemNodes.push(item);
            },
            removeItem: function(index) {
                let self = this;
                let item = this.itemNodes.splice(index, 1)[0];
                item._childNodes.forEach(function(node) {
                    node.parentElement && node.parentElement.removeChild(node);
                    self.unbindNodes(item);
                });
            },
            itemChangedHandler: function(ev, oldVal, newVal, path, index) {
                this.trigger('itemChanged', oldVal, newVal, path, index);
            }
        });
    