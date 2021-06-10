# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2021_06_08_234749) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "pinned_rooms", id: :serial, force: :cascade do |t|
    t.integer "server_id"
    t.text "name", null: false
    t.boolean "closed", default: false, null: false
    t.datetime "created_at", default: -> { "now()" }, null: false
    t.index ["server_id"], name: "pinned_rooms_server_id_idx"
  end

  create_table "room_access_requests", id: :serial, force: :cascade do |t|
    t.integer "server_id"
    t.jsonb "user", null: false
    t.text "name", null: false
    t.datetime "created_at", default: -> { "now()" }, null: false
  end

  create_table "room_access_tokens", id: :serial, force: :cascade do |t|
    t.integer "server_id"
    t.text "name", null: false
    t.jsonb "user", null: false
    t.text "jwt", null: false
    t.jsonb "grantor", null: false
    t.datetime "created_at", default: -> { "now()" }, null: false
  end

  create_table "rooms", force: :cascade do |t|
    t.string "name"
    t.bigint "team_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["team_id"], name: "index_rooms_on_team_id"
  end

  create_table "server_transactions", id: :serial, force: :cascade do |t|
    t.integer "server_id"
    t.text "type", null: false
    t.jsonb "body", null: false
    t.jsonb "user", null: false
    t.datetime "created_at", default: -> { "now()" }, null: false
  end

  create_table "servers", id: :serial, force: :cascade do |t|
    t.text "name", null: false
    t.datetime "created_at", default: -> { "now()" }, null: false
  end

  create_table "teams", force: :cascade do |t|
    t.string "name"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  create_table "users", force: :cascade do |t|
    t.string "name"
    t.string "email"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  add_foreign_key "pinned_rooms", "servers", name: "pinned_rooms_server_id_fkey"
  add_foreign_key "room_access_requests", "servers", name: "room_access_requests_server_id_fkey"
  add_foreign_key "room_access_tokens", "servers", name: "room_access_tokens_server_id_fkey"
  add_foreign_key "rooms", "teams"
  add_foreign_key "server_transactions", "servers", name: "server_transactions_server_id_fkey"
end
