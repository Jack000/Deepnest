#include <nan.h>
#include "minkowski.h"

using v8::FunctionTemplate;
using v8::Handle;
using v8::Object;
using v8::String;
using Nan::GetFunction;
using Nan::New;
using Nan::Set;

// Expose synchronous and asynchronous access to our
// Estimate() function
NAN_MODULE_INIT(InitAll) {
  Set(target, New<String>("calculateNFP").ToLocalChecked(),
    GetFunction(New<FunctionTemplate>(calculateNFP)).ToLocalChecked());
}

NODE_MODULE(addon, InitAll)
