let formOverlay;
let categoryElement;
let saveBtn;
let deleteBtn;
let addBtn;
let cancelBtn;

let editForm = {
  overlay: null,
  container: null,
  markerId: 0,
  categoryId: 0,
  render: function () {
    // 创建外层容器
    this.overlay = document.createElement("div");
    this.overlay.id = "edit-form-overlay";

    // 创建表单容器
    this.container = document.createElement("div");
    this.container.className = "edit-form";

    // 创建标题
    const title = document.createElement("h3");
    title.textContent = "编辑坐标点";
    this.container.appendChild(title);

    // 创建表单元素
    this.name = new FormElement("text", "名称", "名称", "edit-name");
    this.container.appendChild(this.name.wrapper);

    this.category = new FormElement("select", "分类", "分类", "edit-category");
    this.setCategoryOptions();
    this.container.appendChild(this.category.wrapper);

    this.description = new FormElement(
      "textarea",
      "描述",
      "描述",
      "edit-description"
    );
    this.container.appendChild(this.description.wrapper);

    this.image = new FormElement("text", "图片链接", "图片", "edit-image");
    this.container.appendChild(this.image.wrapper);

    this.video = new FormElement("text", "视频链接", "视频", "edit-video");
    this.container.appendChild(this.video.wrapper);

    this.author = new FormElement("text", "作者", "作者", "edit-author");
    this.container.appendChild(this.author.wrapper);

    this.authorLink = new FormElement(
      "text",
      "作者链接",
      "作者链接",
      "edit-author-link"
    );
    this.container.appendChild(this.authorLink.wrapper);

    // 创建按钮容器
    const buttonContainer = document.createElement("div");
    buttonContainer.className = "edit-form-buttons";

    this.deleteBtn = this.createBtn("删除", "delete-btn");
    this.deleteBtn.addEventListener("click", () => {
      allDatas.deleteMarker(this.markerId, this.categoryId);
      deleteMarkerFromCategorySource(this.markerId, this.categoryId);
      this.close();
    });
    buttonContainer.appendChild(this.deleteBtn);

    this.cancelBtn = this.createBtn("取消", "cancel-btn");
    this.cancelBtn.addEventListener("click", () => {
      this.close();
    });
    buttonContainer.appendChild(this.cancelBtn);

    this.saveBtn = this.createBtn("保存", "save-btn");
    this.saveBtn.addEventListener("click", () => {
      const updatedMarker = {
        ...allDatas.getMarker(this.markerId),
        ...this.getFormData(),
      };
      if (this.categoryId === updatedMarker.categoryId) {
        allDatas.editMarker(updatedMarker);
      } else {
        allDatas.deleteMarker(this.markerId, this.categoryId);
        deleteMarkerFromCategorySource(this.markerId, this.categoryId);

        allDatas.addMarker(updatedMarker);
        addMarkerToCategorySource(updatedMarker);
      }

      this.close();
    });
    buttonContainer.appendChild(this.saveBtn);

    this.addBtn = this.createBtn("新建", "add-btn");
    this.addBtn.addEventListener("click", () => {
      const newMarker = {
        ...contextMenu.getLngLat(),
        ...this.getFormData(),
      };
      allDatas.addMarker(newMarker);
      addMarkerToCategorySource(newMarker);
      this.close();
    });
    buttonContainer.appendChild(this.addBtn);

    this.container.appendChild(buttonContainer);
    this.overlay.appendChild(this.container);
    document.body.appendChild(this.overlay);
  },

  createBtn: function (text, className) {
    const button = document.createElement("button");
    button.className = className;
    button.textContent = text;
    return button;
  },

  getFormData: function () {
    return {
      name: this.name.getValue(),
      description: this.description.getValue(),
      image: this.image.getValue(),
      video: this.video.getValue(),
      author: this.author.getValue(),
      authorLink: this.authorLink.getValue(),
      categoryId: parseInt(this.category.getValue()),
      updateTime: new Date()
        .toLocaleString("zh-cn", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
        .replace(/\//g, "-"),
    };
  },

  setCategoryOptions: function () {
    // 清空现有选项
    while (this.category.element.firstChild) {
      this.category.element.removeChild(this.category.element.firstChild);
    }

    // 添加分类选项
    for (const [categoryId, category] of allDatas.categories.entries()) {
      if (!developmentMode && !allDatas.isDefaultCategory(categoryId)) {
        continue;
      }
      const option = document.createElement("option");
      option.value = categoryId;
      option.textContent = category.title;
      this.category.element.appendChild(option);
    }
  },

  open: function (markerId, categoryId, typeOfBtn) {
    this.markerId = markerId;
    this.categoryId = categoryId;
    const marker = allDatas.getMarker(markerId);
    this.name.setValue(marker?.name || "");
    this.description.setValue(marker?.description || "");
    this.image.setValue(marker?.image || "");
    this.video.setValue(marker?.video || "");
    this.author.setValue(marker?.author || "黄大胖不胖");
    this.authorLink.setValue(
      marker?.authorLink || "https://space.bilibili.com/619196/"
    );
    const firstValue = this.category.element.options[0]?.value;
    this.category.setValue(categoryId || firstValue);

    if (typeOfBtn === "edit") {
      this.saveBtn.style.display = "block";
      this.deleteBtn.style.display = "block";
      this.addBtn.style.display = "none";
    } else if (typeOfBtn === "add") {
      this.saveBtn.style.display = "none";
      this.deleteBtn.style.display = "none";
      this.addBtn.style.display = "block";
    } else {
      this.saveBtn.style.display = "none";
      this.deleteBtn.style.display = "none";
      this.addBtn.style.display = "none";
    }

    this.overlay.style.visibility = "visible";
  },

  close: function () {
    this.overlay.style.visibility = "hidden";
  },
};

class FormElement {
  constructor(type, placeholder, label, id) {
    console.assert(
      type === "text" || type === "textarea" || type === "select",
      "Invalid type"
    );
    this.type = type;
    this.placeholder = placeholder;
    this.label = label;
    this.id = id;
    this.wrapper = this.render();
  }

  render() {
    // 创建包装容器
    const wrapper = document.createElement("div");
    wrapper.className = "edit-form-field";

    // 创建标签
    const label = document.createElement("label");
    label.textContent = this.label;
    label.className = "edit-form-label";

    // 创建输入元素
    if (this.type === "text") {
      this.element = document.createElement("input");
      this.element.type = "text";
    } else if (this.type === "textarea") {
      this.element = document.createElement("textarea");
    } else if (this.type === "select") {
      this.element = document.createElement("select");
    }
    this.element.id = this.id;
    this.element.placeholder = this.placeholder;

    // 组装
    wrapper.appendChild(label);
    wrapper.appendChild(this.element);
    return wrapper;
  }

  getValue() {
    return this.element.value;
  }

  setValue(value) {
    this.element.value = value;
  }
}