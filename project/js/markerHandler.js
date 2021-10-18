var list = [];
var models = null;
AFRAME.registerComponent("markhandler", {
  init: async function() {
    this.el.addEventListener("markFound", () => {
      var modelName = this.el.getAttribute("model_name");
      var barcodeValue = this.el.getAttribute("value");
      list.push({
        model_name: modelName,
        barcode_value: barcodeValue
      });
      this.el.setAttribute("visible", true);
    });
    this.el.addEventListener("markLost", () => {
      var modelName = this.el.getAttribute("model_name");
      var index = list.findIndex(x => x.model_name === modelName);
      if (index > -1) {
        list.splice(index, 1);
      }
    });
  },
  getDistance: function(elA, elB) {
    return elA.object3D.position.distanceTo(elB.object3D.position);
  },
  isModelPresentInArray: function(arr, val) {
    for (var i of arr) {
      if (i.model_name === val) {
        return true;
      }
    }
    return false;
  },
  tick: async function() {
    if (list.length > 1) {
      var isBaseModelPresent = this.isModelPresentInArray(list, "base");
      var messageText = document.querySelector("#message-text");
      if (!isBaseModelPresent) {
        messageText.setAttribute("visible", true);
      } else {
        if (models === null) {
          models = await this.getModels();
        }
        messageText.setAttribute("visible", false);
        this.placeTheModel("road", models);
        this.placeTheModel("car", models);
        this.placeTheModel("build1", models);
        this.placeTheModel("build2", models);
        this.placeTheModel("build3", models);
        this.placeTheModel("sun", models);
      }
    }
  },
  getModels: function() {
    return fetch("js/models.json")
      .then(res => res.json())
      .then(data => data);
  },
  getModelGeometry: function(models, modelName) {
    var barcodes = Object.keys(models);
    for (var barcode of barcodes) {
      if (models[barcode].model_name === modelName) {
        return {
          position: models[barcode]["placement_position"],
          rotation: models[barcode]["placement_rotation"],
          scale: models[barcode]["placement_scale"],
          model_url: models[barcode]["model_url"]
        };
      }
    }
  },
  placeTheModel: function(modelName, models) {
    var isListContainModel = this.isModelPresentInArray(list, modelName);
    if (isListContainModel) {
      var distance = null;
      var mark1 = document.querySelector(`#mark-base`);
      var mark2 = document.querySelector(`#mark-${modelName}`);

      distance = this.getDistance(mark1, mark2);
      if (distance < 1.25) {
        var modelEl = document.querySelector(`#${modelName}`);
        modelEl.setAttribute("visible", false);

        var isModelPlaced = document.querySelector(`#model-${modelName}`);
        if (isModelPlaced === null) {
          var el = document.createElement("a-entity");
          var modelGeometry = this.getModelGeometry(models, modelName);
          el.setAttribute("id", `model-${modelName}`);
          el.setAttribute("gltf-model", `url(${modelGeometry.model_url})`);
          el.setAttribute("position", modelGeometry.position);
          el.setAttribute("rotation", modelGeometry.rotation);
          el.setAttribute("scale", modelGeometry.scale);
          mark1.appendChild(el);
        }
      }
    }
  }
});