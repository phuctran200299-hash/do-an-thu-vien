<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Role extends Model
{
    use HasFactory;

    // vai trò chuẩn dùng trong toàn hệ thống
    public const READER = 'reader';
    public const STAFF = 'staff';
    public const ADMIN = 'admin';

    protected $fillable = ['name', 'description'];

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}
