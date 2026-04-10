# Distributed under the OSI-approved BSD 3-Clause License.  See accompanying
# file Copyright.txt or https://cmake.org/licensing for details.

cmake_minimum_required(VERSION 3.5)

file(MAKE_DIRECTORY
  "/app/src/build/_deps/picotool-src"
  "/app/src/build/_deps/picotool-build"
  "/app/src/build/_deps/picotool-subbuild/picotool-populate-prefix"
  "/app/src/build/_deps/picotool-subbuild/picotool-populate-prefix/tmp"
  "/app/src/build/_deps/picotool-subbuild/picotool-populate-prefix/src/picotool-populate-stamp"
  "/app/src/build/_deps/picotool-subbuild/picotool-populate-prefix/src"
  "/app/src/build/_deps/picotool-subbuild/picotool-populate-prefix/src/picotool-populate-stamp"
)

set(configSubDirs )
foreach(subDir IN LISTS configSubDirs)
    file(MAKE_DIRECTORY "/app/src/build/_deps/picotool-subbuild/picotool-populate-prefix/src/picotool-populate-stamp/${subDir}")
endforeach()
if(cfgdir)
  file(MAKE_DIRECTORY "/app/src/build/_deps/picotool-subbuild/picotool-populate-prefix/src/picotool-populate-stamp${cfgdir}") # cfgdir has leading slash
endif()
