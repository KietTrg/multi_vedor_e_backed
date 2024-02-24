const productModel = require("../../models/productModel");
const { responseReturn } = require("../../utiles/response");
const cloudinary = require("cloudinary").v2;
const formidable = require("formidable");
class productController {
  add_product = async (req, res) => {
    const { id } = req;
    const form = formidable({ multiples: true });
    form.parse(req, async (err, field, files) => {
      let {
        name,
        category,
        description,
        stock,
        price,
        discount,
        shopName,
        brand,
      } = field;
      const { images } = files;
      console.log("images: ", images);

      name = name.trim();
      const slug = name.split(" ").join("-");

      cloudinary.config({
        cloud_name: process.env.CLOUND_NAME,
        api_key: process.env.API_KEY,
        api_secret: process.env.API_SECRET,
        secure: true,
      });

      try {
        let allImageUrl = [];
        if (!images.length) {
          const result = await cloudinary.uploader.upload(images.filepath, {
            folder: "products",
          });
          allImageUrl = [...allImageUrl, result.url];
        } else {
          for (let i = 0; i < images.length; i++) {
            const result = await cloudinary.uploader.upload(
              images[i].filepath,
              {
                folder: "products",
              }
            );
            allImageUrl = [...allImageUrl, result.url];
          }
        }
        const product = await productModel.create({
          sellerId: id,
          name,
          slug,
          shopName,
          brand: brand.trim(),
          category: category.trim(),
          description: description.trim(),
          stock: parseInt(stock),
          price: parseInt(price),
          discount: parseInt(discount),
          images: allImageUrl,
        });
        responseReturn(res, 201, { message: "Product add success" });
      } catch (error) {
        responseReturn(res, 500, { error: error.message });
      }
    });
  };
  delete_product = async (req, res) => {
    const { productId, status } = req.body;
    try {
      await productModel.findByIdAndUpdate(productId, {
        status: status,
      });

      responseReturn(res, 200, {
        message: "product delete success",
      });
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };
  products_get = async (req, res) => {
    const { page, searchValue, parPage } = req.query;
    const { id } = req;
    const skipPage = parseInt(parPage) * (parseInt(page) - 1);
    try {
      if (searchValue) {
        const products = await productModel
          .find({
            name: new RegExp(searchValue, "i"),
            sellerId: id,
          })
          .skip(skipPage)
          .limit(parPage)
          .sort({
            createdAt: -1,
          });
        const totalProduct = await productModel
          .find({
            name: new RegExp(searchValue, "i"),
            sellerId: id,
          })
          .countDocuments();
        responseReturn(res, 200, { totalProduct, products });
      } else {
        const products = await productModel
          .find({ sellerId: id })
          .skip(skipPage)
          .limit(parPage)
          .sort({
            createdAt: -1,
          });
        const totalProduct = await productModel
          .find({ sellerId: id })
          .countDocuments();
        responseReturn(res, 200, { totalProduct, products });
      }
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };
  product_get = async (req, res) => {
    const { productId } = req.params;

    try {
      const product = await productModel.findById(productId);
      responseReturn(res, 200, { product });
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };
  update_product = async (req, res) => {
    const form = formidable({ multiples: true });
    form.parse(req, async (err, field, files) => {
      console.log("files: ", files);
      console.log("field: ", field);
      let {
        name,
        description,
        discount,
        brand,
        stock,
        price,
        productId,
        images,
      } = field;
      const { newImg } = files;

      name = name?.trim();
      const slug = name?.split(" ").join("-");
      cloudinary.config({
        cloud_name: process.env.CLOUND_NAME,
        api_key: process.env.API_KEY,
        api_secret: process.env.API_SECRET,
        secure: true,
      });
      try {
        let allImageUrl = [];
        if (images) {
          if (typeof images === "string") {
            allImageUrl.push(images);
          } else {
            allImageUrl = [...images];
          }
        }

        if (newImg) {
          if (newImg?.length > 0) {
            for (let i = 0; i < newImg?.length; i++) {
              const result = await cloudinary.uploader.upload(
                newImg[i].filepath,
                {
                  folder: "products",
                }
              );
              allImageUrl.push(result.url);
            }
          } else {
            const result = await cloudinary.uploader.upload(newImg?.filepath, {
              folder: "products",
            });
            allImageUrl.push(result.url);
          }
        }

        await productModel.findByIdAndUpdate(productId, {
          name,
          description,
          discount,
          brand,
          stock,
          price,
          productId,
          slug,
          images: allImageUrl,
        });
        const product = await productModel.findById(productId);
        responseReturn(res, 200, {
          product,
          message: "product update success",
        });
      } catch (error) {
        console.log("error: ", error);
        responseReturn(res, 500, { error: error.message });
      }
    });
  };
  product_image_update = async (req, res) => {
    const form = formidable({ multiples: true });

    form.parse(req, async (err, field, files) => {
      console.log("files: ", files);
      console.log("field: ", field);
      const { productId, oldImage } = field;
      const { newImage } = files;

      if (err) {
        responseReturn(res, 404, { error: err.message });
      } else {
        try {
          cloudinary.config({
            cloud_name: process.env.CLOUND_NAME,
            api_key: process.env.API_KEY,
            api_secret: process.env.API_SECRET,
            secure: true,
          });
          const result = await cloudinary.uploader.upload(newImage.filepath, {
            folder: "products",
          });
          if (result) {
            let { images } = await productModel.findById(productId);
            const index = images.findIndex((img) => img === oldImage);
            images[index] = result.url;

            await productModel.findByIdAndUpdate(productId, {
              images,
            });
            const product = await productModel.findById(productId);
            responseReturn(res, 200, {
              product,
              message: "product image update success",
            });
          } else {
            responseReturn(res, 404, { error: "image upload failed" });
          }
        } catch (error) {
          responseReturn(res, 404, { error: error.message });
        }
      }
    });
  };
}
module.exports = new productController();
